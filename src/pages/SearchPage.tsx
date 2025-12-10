import React, { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { tmdb, type TMDBSeries } from '../services/tmdb';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TMDBSeries[]>([]);
    const [loading, setLoading] = useState(false);
    const { addToWatchlist, isInWatchlist } = useWatchlist();

    // Effect to switch to watchlist if query is empty


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const data = await tmdb.searchSeries(query);
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Discover Series</h1>
                <p className="text-zinc-400">Search for your favorite TV shows and track them.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search TV series..."
                        className="pl-10"
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((series) => (
                    <Card key={series.id} className="group overflow-hidden border-zinc-800 bg-zinc-900/40 hover:border-zinc-700">
                        <div className="aspect-[2/3] relative overflow-hidden bg-zinc-800">
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
                                    onClick={() => addToWatchlist(series)}
                                    disabled={isInWatchlist(series.id)}
                                    variant={isInWatchlist(series.id) ? 'secondary' : 'primary'}
                                >
                                    {isInWatchlist(series.id) ? (
                                        <>
                                            <Check size={16} /> Added
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} /> Track
                                        </>
                                    )}
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

                {results.length === 0 && !loading && query && (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        No results found.
                    </div>
                )}

                {results.length === 0 && !loading && !query && (
                    <div className="col-span-full py-12 text-center text-zinc-500 flex flex-col items-center gap-4">
                        <Search size={48} className="opacity-20" />
                        <p>Search for series to add them to your watchlist.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
