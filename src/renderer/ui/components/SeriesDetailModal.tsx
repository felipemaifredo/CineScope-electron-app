//Libs
import { useEffect, useState } from "react"
import { Star, Calendar, Film, Bookmark, BookmarkCheck } from "lucide-react"

//Imports
import { Modal } from "./ui/Modal"
import { Button } from "./ui/Button"
import { tmdb } from "@/Lib/utils/tmdb"
import { useWatchlist } from "@/App/context/WatchlistContext"

//Types
import { type TMDBSeries } from "@/Lib/utils/tmdb"

type SeriesDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  seriesId: number | null
}

//Main
export const SeriesDetailModal = ({ isOpen, onClose, seriesId }: SeriesDetailModalProps) => {
  const [details, setDetails] = useState<TMDBSeries | null>(null)
  const [loading, setLoading] = useState(false)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  useEffect(function () {
    async function loadDetails() {
      if (!seriesId || !isOpen) return
      setLoading(true)
      try {
        const data = await tmdb.getSeriesDetails(seriesId)
        setDetails(data)
      } catch (error) {
        console.error("Failed to load series details:", error)
        setDetails(null)
      } finally {
        setLoading(false)
      }
    }
    loadDetails()
  }, [seriesId, isOpen])

  if (!isOpen || !seriesId) return null

  const isTracked = isInWatchlist(seriesId)

  async function handleWatchlistToggle() {
    if (!details) return
    if (isTracked) {
      await removeFromWatchlist(details.id)
    } else {
      await addToWatchlist(details)
    }
  }

  function getStatusColor(status?: string) {
    if (!status) return "bg-zinc-800 text-zinc-400"
    const s = status.toLowerCase()
    if (s.includes("returning") || s.includes("in production") || s.includes("planned")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    }
    if (s.includes("ended") || s.includes("pilot")) {
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    }
    return "bg-red-500/10 text-red-400 border border-red-500/20"
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "TBA"
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={details?.name || "Series Details"} className="max-w-2xl !p-0 overflow-hidden">
      {loading ? (
        <div className="py-20 text-center text-zinc-500 animate-pulse">
          Loading detailed series data...
        </div>
      ) : !details ? (
        <div className="py-20 text-center text-zinc-500">
          Failed to load series details.
        </div>
      ) : (
        <div className="flex flex-col">
          {details.backdrop_path && (
            <div
              className="relative w-full h-48 bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${details.backdrop_path})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            </div>
          )}

          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-48 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-800 shrink-0 shadow-lg self-center md:self-start">
                {details.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${details.poster_path}`}
                    alt={details.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold tracking-tight text-white">{details.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(details.status)}`}>
                    {details.status || "Unknown Status"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Star size={16} fill="currentColor" />
                    {details.vote_average?.toFixed(1) || "N/A"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    {details.first_air_date ? details.first_air_date.split("-")[0] : "TBA"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Film size={16} />
                    {details.number_of_seasons} Seasons ({details.number_of_episodes} Episodes)
                  </span>
                </div>

                {details.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {details.genres.map(function (g) {
                      return (
                        <span key={g.id} className="text-xs px-2 py-0.5 rounded bg-indigo-600/10 text-indigo-300 border border-indigo-500/10">
                          {g.name}
                        </span>
                      )
                    })}
                  </div>
                )}

                {details.networks && details.networks.length > 0 && (
                  <div className="text-xs text-zinc-500">
                    Network: <span className="text-zinc-300 font-medium">{details.networks.map(function (n) { return n.name }).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Overview</h4>
              <p className="text-zinc-300 text-sm leading-relaxed max-h-36 overflow-y-auto pr-2">
                {details.overview || "No overview available for this series."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 border-t border-zinc-800/60 pt-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase">Last Episode Aired</span>
                {details.last_episode_to_air ? (
                  <div className="text-sm">
                    <div className="font-semibold text-zinc-200">
                      S{details.last_episode_to_air.season_number}E{details.last_episode_to_air.episode_number} - {details.last_episode_to_air.name}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Aired on {formatDate(details.last_episode_to_air.air_date)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">No air history available</div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase">Next Episode Airing</span>
                {details.next_episode_to_air ? (
                  <div className="text-sm">
                    <div className="font-semibold text-indigo-400">
                      S{details.next_episode_to_air.season_number}E{details.next_episode_to_air.episode_number} - {details.next_episode_to_air.name}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Airing on {formatDate(details.next_episode_to_air.air_date)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">No upcoming episode scheduled</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-800/60 pt-4 shrink-0">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button
                variant={isTracked ? "danger" : "primary"}
                onClick={handleWatchlistToggle}
                className="gap-2"
              >
                {isTracked ? (
                  <>
                    <BookmarkCheck size={18} /> Stop Tracking
                  </>
                ) : (
                  <>
                    <Bookmark size={18} /> Track Series
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
