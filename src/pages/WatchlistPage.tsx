import { Trash2, Tv } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const WatchlistPage = () => {
    const { watchlist, removeFromWatchlist } = useWatchlist();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
                <p className="text-zinc-400">Track your favorite series.</p>
            </div>

            {watchlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-zinc-500 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10">
                    <Tv size={48} className="mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-zinc-300">No series tracked yet</h3>
                    <p>Go to the Search page to add TV shows.</p>
                </div>
            ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 280px))", justifyContent: "center" }}>
                    {watchlist.map((series) => (
                        <Card key={series.id} className="group overflow-hidden border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 max-w-[280px] min-w-[280px]">
                            <div className="aspect-[2/3] relative overflow-hidden bg-zinc-800 max-h-[420px]">
                                {series.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                                        alt={series.name}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <Button
                                        className="w-full gap-2"
                                        onClick={() => removeFromWatchlist(series.id)}
                                        variant="danger"
                                    >
                                        <Trash2 size={16} /> Remove
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold truncate" title={series.name}>{series.name}</h3>
                                <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                                    <span>{series.first_air_date?.split('-')[0] || 'TBA'}</span>
                                    <span>⭐ {series.vote_average?.toFixed(1)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
