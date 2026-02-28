import axios from 'axios';
import { prisma } from '../lib/prisma';

export class SpotifyService {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    private async getAccessToken() {
        const user = await prisma.user.findUnique({ where: { id: this.userId } });
        if (!user) throw new Error('User not found');
        return user.accessToken;
    }

    async getLikedTracks() {
        const token = await this.getAccessToken();
        let allTracks: any[] = [];
        let url = 'https://api.spotify.com/v1/me/tracks?limit=50';

        try {
            while (url && allTracks.length < 500) { // Limit to 500 for MVP to avoid long wait times
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const validTracks = response.data.items.filter((item: any) => item.track).map((item: any) => item.track);
                allTracks = [...allTracks, ...validTracks];
                url = response.data.next;
            }
            return allTracks;
        } catch (error) {
            console.error('Error fetching liked tracks', error);
            throw new Error('Failed to fetch liked tracks');
        }
    }

    async getAudioFeatures(trackIds: string[]) {
        const token = await this.getAccessToken();
        let allFeatures: any[] = [];

        try {
            // Spotify API allows max 100 track IDs per request for audio features
            for (let i = 0; i < trackIds.length; i += 100) {
                const chunk = trackIds.slice(i, i + 100);
                const response = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                allFeatures = [...allFeatures, ...response.data.audio_features.filter(Boolean)];
            }
            return allFeatures;
        } catch (error) {
            console.error('Error fetching audio features', error);
            throw new Error('Failed to fetch audio features');
        }
    }
}
