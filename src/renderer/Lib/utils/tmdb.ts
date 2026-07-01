//Libs
import axios from "axios"

//Consts
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
let API_KEY = ""

//Funcs
export function setApiKey(key: string) {
  API_KEY = key
}

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL
})

tmdbClient.interceptors.request.use(function (config) {
  if (API_KEY) {
    if (API_KEY.length > 100) {
      config.headers.Authorization = `Bearer ${API_KEY}`
    } else {
      config.params = config.params || {}
      config.params.api_key = API_KEY
    }
  }
  return config
})

//Types
export type TMDBEpisode = {
  id: number
  name: string
  episode_number: number
  season_number: number
  air_date: string
  overview: string
  still_path: string | null
}

export type TMDBSeries = {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  next_episode_to_air?: TMDBEpisode | null
  last_episode_to_air?: TMDBEpisode | null
  genres?: { id: number; name: string }[]
  number_of_seasons?: number
  number_of_episodes?: number
  status?: string
  networks?: { name: string; logo_path: string | null }[]
}

export type TMDBSeason = {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string
  episodes?: TMDBEpisode[]
}

export type TMDBGenreTypes = {
  id: number
  name: string
}

//Main
export const tmdb = {
  async searchSeries(query: string): Promise<TMDBSeries[]> {
    if (!query) return []
    const response = await tmdbClient.get("/search/tv", {
      params: { query }
    })
    return response.data.results
  },

  async getSeriesDetails(id: number): Promise<TMDBSeries> {
    const response = await tmdbClient.get(`/tv/${id}`)
    return response.data
  },

  async getSeasonDetails(id: number, seasonNumber: number): Promise<TMDBSeason> {
    const response = await tmdbClient.get(`/tv/${id}/season/${seasonNumber}`)
    return response.data
  },

  async getGenres(): Promise<TMDBGenreTypes[]> {
    const response = await tmdbClient.get("/genre/tv/list")
    return response.data.genres
  },

  async discoverSeries(options?: {
    genreIds?: number[]
    sortBy?: "first_air_date.desc" | "first_air_date.asc"
  }): Promise<TMDBSeries[]> {
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
