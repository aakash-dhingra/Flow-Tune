import { Request, Response, NextFunction } from 'express';
import { SpotifyService } from '../services/spotify';
import { kmeans } from 'ml-kmeans';

export const analyzeLikedTracks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const spotifyService = new SpotifyService(userId);

        // 1. Fetch liked tracks
        const tracks = await spotifyService.getLikedTracks();
        const trackIds = tracks.map(t => t.id);

        // 2. Fetch audio features
        const features = await spotifyService.getAudioFeatures(trackIds);

        // Filter tracks that have features (sometimes null)
        const validData = tracks.map(track => {
            const feat = features.find(f => f.id === track.id);
            return feat ? { track, features: feat } : null;
        }).filter(Boolean) as { track: any, features: any }[];

        if (validData.length === 0) {
            return res.status(400).json({ error: 'No valid tracks found' });
        }

        // 3. Cluster using k-means
        // We cluster based on: energy, valence, tempo (normalized), acousticness
        // Normalize tempo (typically 0-200, so divide by 200 for 0-1 range to match others)
        const dataPoints = validData.map(d => [
            d.features.energy,
            d.features.valence,
            d.features.tempo / 200,
            d.features.acousticness
        ]);

        const k = Math.min(4, dataPoints.length); // Max 4 clusters
        if (k < 1) return res.status(400).json({ error: 'Not enough data points' });

        const result = kmeans(dataPoints, k, { initialization: 'kmeans++' });

        // Grouping logic (simplified labels based on centroids for MVP)
        const groups: { [key: number]: any[] } = {};
        for (let i = 0; i < k; i++) groups[i] = [];

        result.clusters.forEach((clusterIndex: number, dataIndex: number) => {
            groups[clusterIndex].push(validData[dataIndex]);
        });

        const labeledClusters = result.centroids.map((centroid: number[], index: number) => {
            const [energy, valence] = centroid;

            let label = 'Mixed';
            if (energy > 0.7 && valence > 0.5) label = 'High Energy';
            else if (energy < 0.5 && valence < 0.5) label = 'Emotional';
            else if (energy < 0.6 && valence > 0.5) label = 'Chill';

            return {
                id: index,
                label,
                centroid,
                tracks: groups[index].map(g => ({
                    id: g.track.id,
                    name: g.track.name,
                    artist: g.track.artists.map((a: any) => a.name).join(', '),
                    imageUrl: g.track.album?.images?.[0]?.url,
                    features: g.features
                }))
            };
        });

        res.json({ clusters: labeledClusters });
    } catch (error) {
        next(error);
    }
};
