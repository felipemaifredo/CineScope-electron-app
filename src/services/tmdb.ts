import axios from 'axios'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
// In a real app, this should be env var, but for this demo/setup we might need user input
// I'll set up a way to configure it, but use a default or placeholder.
// For now, I will assume the user will safeguard their key.
let API_KEY = ''

export const setApiKey = (key: string) => {
    API_KEY = key
}

const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
})

tmdbClient.interceptors.request.use((config) => {
    if (API_KEY) {
        // Check if it's a v4 Read Access Token (JWT) which is long
        if (API_KEY.length > 100) {
            config.headers.Authorization = `Bearer ${API_KEY}`
        } else {
            // v3 API Key
            config.params = config.params || {}
            config.params.api_key = API_KEY
        }
    }
    return config
})

export interface TMDBSeries {
    id: number
    name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    first_air_date: string
    vote_average: number
    next_episode_to_air?: TMDBEpisode | null
    last_episode_to_air?: TMDBEpisode | null
}

export interface TMDBSeason {
    id: number
    name: string
    season_number: number
    episode_count: number
    air_date: string
    episodes?: TMDBEpisode[]
}

export interface TMDBEpisode {
    id: number
    name: string
    episode_number: number
    season_number: number
    air_date: string
    overview: string
    still_path: string | null
}

export type TMDBGenreTypes = {
    id: number
    name: string
}

export const tmdb = {
    searchSeries: async (query: string): Promise<TMDBSeries[]> => {
        if (!query) return []
        const response = await tmdbClient.get('/search/tv', {
            params: { query }
        })
        return response.data.results
    },

    getSeriesDetails: async (id: number): Promise<TMDBSeries> => {
        const response = await tmdbClient.get(`/tv/${id}`)
        return response.data
    },

    getSeasonDetails: async (id: number, seasonNumber: number): Promise<TMDBSeason> => {
        const response = await tmdbClient.get(`/tv/${id}/season/${seasonNumber}`)
        return response.data
    },

    getGenres: async (): Promise<TMDBGenreTypes[]> => {
        const response = await tmdbClient.get("/genre/tv/list")
        return response.data.genres
    },

    discoverSeries: async (options?: {
        genreIds?: number[]
        sortBy?: "first_air_date.desc" | "first_air_date.asc"
    }): Promise<TMDBSeries[]> => {
        const params: any = {}

        if (options?.genreIds && options.genreIds.length > 0) {
            params.with_genres = options.genreIds.join(",")
        }

        if (options?.sortBy) {
            params.sort_by = options.sortBy
        } else {
            params.sort_by = "popularity.desc"
        }

        const response = await tmdbClient.get("/discover/tv", { params })
        return response.data.results
    }
}
