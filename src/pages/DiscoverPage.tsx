import { useState, useEffect } from "react"
import { Compass, Plus, Check, Filter, X } from "lucide-react"
import { useWatchlist } from "../context/WatchlistContext"
import { tmdb, type TMDBSeries, type TMDBGenreTypes } from "../services/tmdb"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { Select } from "../components/ui/Select"
import { Modal } from "../components/ui/Modal"

export function DiscoverPage() {
    const [series, setSeries] = useState<TMDBSeries[]>([])
    const [genres, setGenres] = useState<TMDBGenreTypes[]>([])
    const [selectedGenres, setSelectedGenres] = useState<number[]>([])
    const [sortBy, setSortBy] = useState<"first_air_date.desc" | "first_air_date.asc">("first_air_date.desc")
    const [loading, setLoading] = useState(false)
    const [showGenreModal, setShowGenreModal] = useState(false)
    const { addToWatchlist, isInWatchlist } = useWatchlist()

    // Load genres on mount
    useEffect(() => {
        async function loadGenres() {
            try {
                const genreList = await tmdb.getGenres()
                setGenres(genreList)
            } catch (error) {
                console.error("Failed to load genres:", error)
            }
        }
        loadGenres()
    }, [])

    // Load series when filters change
    useEffect(() => {
        async function loadSeries() {
            setLoading(true)
            try {
                const data = await tmdb.discoverSeries({
                    genreIds: selectedGenres.length > 0 ? selectedGenres : undefined,
                    sortBy
                })
                setSeries(data)
            } catch (error) {
                console.error("Failed to load series:", error)
            } finally {
                setLoading(false)
            }
        }
        loadSeries()
    }, [selectedGenres, sortBy])

    function toggleGenre(genreId: number) {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        )
    }

    function clearGenres() {
        setSelectedGenres([])
    }

    const selectedGenreNames = genres
        .filter(g => selectedGenres.includes(g.id))
        .map(g => g.name)

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Discover Series</h1>
                <p className="text-zinc-400">Browse and explore popular TV shows.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <Button
                        variant="secondary"
                        className="w-full justify-between gap-2"
                        onClick={() => setShowGenreModal(true)}
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={16} />
                            <span>
                                {selectedGenres.length === 0
                                    ? "All Genres"
                                    : `${selectedGenres.length} selected`}
                            </span>
                        </div>
                        {selectedGenres.length > 0 && (
                            <X
                                size={16}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    clearGenres()
                                }}
                            />
                        )}
                    </Button>
                </div>

                <div className="w-full sm:w-auto min-w-[200px]">
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    >
                        <option value="first_air_date.desc">Newest First</option>
                        <option value="first_air_date.asc">Oldest First</option>
                    </Select>
                </div>
            </div>

            {/* Selected Genres Tags */}
            {selectedGenreNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedGenreNames.map(name => (
                        <span
                            key={name}
                            className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-sm"
                        >
                            {name}
                        </span>
                    ))}
                </div>
            )}

            {/* Series Grid */}
            <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 280px))", justifyContent: "center" }}>
                {loading ? (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        Loading...
                    </div>
                ) : series.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-zinc-500 flex flex-col items-center gap-4">
                        <Compass size={48} className="opacity-20" />
                        <p>No series found with the selected filters.</p>
                    </div>
                ) : (
                    series.map((show) => (
                        <Card key={show.id} className="group overflow-hidden border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 max-w-[280px] min-w-[280px]">
                            <div className="aspect-[2/3] relative overflow-hidden bg-zinc-800 max-h-[420px]">
                                {show.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                                        alt={show.name}
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
                                        onClick={() => addToWatchlist(show)}
                                        disabled={isInWatchlist(show.id)}
                                        variant={isInWatchlist(show.id) ? "secondary" : "primary"}
                                    >
                                        {isInWatchlist(show.id) ? (
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
                                <h3 className="font-semibold truncate" title={show.name}>{show.name}</h3>
                                <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                                    <span>{show.first_air_date?.split("-")[0] || "TBA"}</span>
                                    <span>⭐ {show.vote_average?.toFixed(1)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Genre Filter Modal */}
            <Modal
                isOpen={showGenreModal}
                onClose={() => setShowGenreModal(false)}
                title="Filter by Genre"
            >
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {genres.map(genre => (
                        <label
                            key={genre.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedGenres.includes(genre.id)}
                                onChange={() => toggleGenre(genre.id)}
                                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-zinc-200">{genre.name}</span>
                        </label>
                    ))}
                </div>
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="secondary"
                        onClick={clearGenres}
                        className="flex-1"
                    >
                        Clear All
                    </Button>
                    <Button
                        onClick={() => setShowGenreModal(false)}
                        className="flex-1"
                    >
                        Apply
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
