//Libs
import React, { createContext, useContext, useEffect, useState } from "react"

//Imports
import { storage } from "../../Lib/utils/storage"

//Types
import { type TMDBSeries, setApiKey } from "../../Lib/utils/tmdb"

//Types
type WatchlistContextType = {
  watchlist: TMDBSeries[]
  addToWatchlist: (series: TMDBSeries) => Promise<void>
  removeFromWatchlist: (id: number) => Promise<void>
  isInWatchlist: (id: number) => boolean
  refreshWatchlist: () => Promise<void>
}

//Consts
const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

//Main
export const WatchlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [watchlist, setWatchlist] = useState<TMDBSeries[]>([])

  async function refreshWatchlist() {
    try {
      const data = await storage.loadWatchlist()
      setWatchlist(data)

      const settings = await storage.loadSettings()
      if (settings.apiKey) {
        setApiKey(settings.apiKey)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  useEffect(function () {
    refreshWatchlist()
  }, [])

  async function addToWatchlist(series: TMDBSeries) {
    if (watchlist.some(function (s) { return s.id === series.id })) return
    const newWatchlist = [...watchlist, series]
    setWatchlist(newWatchlist)
    await storage.saveWatchlist(newWatchlist)
  }

  async function removeFromWatchlist(id: number) {
    const newWatchlist = watchlist.filter(function (s) { return s.id !== id })
    setWatchlist(newWatchlist)
    await storage.saveWatchlist(newWatchlist)
  }

  function isInWatchlist(id: number) {
    return watchlist.some(function (s) { return s.id === id })
  }

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, refreshWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

//Funcs
export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider")
  }
  return context
}
