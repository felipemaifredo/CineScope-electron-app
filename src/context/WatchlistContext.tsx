import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { type TMDBSeries, setApiKey } from '../services/tmdb';

interface WatchlistContextType {
    watchlist: TMDBSeries[];
    addToWatchlist: (series: TMDBSeries) => Promise<void>;
    removeFromWatchlist: (id: number) => Promise<void>;
    isInWatchlist: (id: number) => boolean;
    refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
    const [watchlist, setWatchlist] = useState<TMDBSeries[]>([]);

    const refreshWatchlist = async () => {
        try {
            const data = await storage.loadWatchlist();
            setWatchlist(data);

            // Also load settings
            const settings = await storage.loadSettings();
            if (settings.apiKey) {
                setApiKey(settings.apiKey);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    useEffect(() => {
        refreshWatchlist();
    }, []);

    const addToWatchlist = async (series: TMDBSeries) => {
        if (watchlist.some((s) => s.id === series.id)) return;
        const newWatchlist = [...watchlist, series];
        setWatchlist(newWatchlist);
        await storage.saveWatchlist(newWatchlist);
    };

    const removeFromWatchlist = async (id: number) => {
        const newWatchlist = watchlist.filter((s) => s.id !== id);
        setWatchlist(newWatchlist);
        await storage.saveWatchlist(newWatchlist);
    };

    const isInWatchlist = (id: number) => watchlist.some((s) => s.id === id);

    return (
        <WatchlistContext.Provider
            value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, refreshWatchlist }}
        >
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    const context = useContext(WatchlistContext);
    if (context === undefined) {
        throw new Error('useWatchlist must be used within a WatchlistProvider');
    }
    return context;
}
