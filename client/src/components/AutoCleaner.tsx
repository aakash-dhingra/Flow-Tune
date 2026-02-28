import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, Music, Check, RefreshCw } from 'lucide-react';

interface Track {
    id: string;
    name: string;
    artist: string;
    imageUrl?: string;
}

interface Cluster {
    id: number;
    label: string;
    tracks: Track[];
}

export const AutoCleaner = () => {
    const [loading, setLoading] = useState(false);
    const [clusters, setClusters] = useState<Cluster[]>([]);
    const [error, setError] = useState('');

    const analyzeTracks = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('http://localhost:3001/api/cleaner/analyze', {}, { withCredentials: true });
            setClusters(data.clusters);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to analyze tracks');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Playlist Auto-Cleaner</h2>
                    <p className="text-textSecondary">Organize your liked songs into distinct clusters.</p>
                </div>
                <button
                    onClick={analyzeTracks}
                    disabled={loading}
                    className="bg-primary text-black px-6 py-2 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    {loading ? 'Analyzing...' : 'Analyze Liked Songs'}
                </button>
            </div>

            {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20">{error}</div>}

            {clusters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clusters.map(cluster => (
                        <div key={cluster.id} className="glass-panel p-6 flex flex-col max-h-[500px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white capitalize">{cluster.label}</h3>
                                <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{cluster.tracks.length} songs</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
                                {cluster.tracks.slice(0, 50).map(track => (
                                    <div key={track.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                        {track.imageUrl ? (
                                            <img src={track.imageUrl} alt={track.name} className="w-10 h-10 rounded-md object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                                                <Music className="w-5 h-5 text-textSecondary" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{track.name}</p>
                                            <p className="text-xs text-textSecondary truncate">{track.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {cluster.tracks.length > 50 && (
                                    <p className="text-xs text-center text-textSecondary mt-2">...and {cluster.tracks.length - 50} more</p>
                                )}
                            </div>

                            <button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-colors">
                                Save as Playlist
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
