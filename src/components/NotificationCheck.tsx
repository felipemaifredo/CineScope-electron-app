import { useEffect } from "react"
import { useWatchlist } from "../context/WatchlistContext"
import { storage } from "../services/storage"

export function NotificationCheck() {
    const { watchlist } = useWatchlist()

    useEffect(() => {
        const checkNotifications = async () => {
            const settings = await storage.loadSettings()

            // Only proceed if notifications are enabled
            if (!settings.notificationsEnabled) {
                return
            }

            // Request notification permission if not already granted
            if (Notification.permission === "default") {
                await Notification.requestPermission()
            }

            if (Notification.permission !== "granted") {
                return
            }

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Get timing preferences (default to same day only if not set)
            const timing = settings.notificationTiming || {
                sameDay: true,
                oneDayBefore: false,
                twoDaysBefore: false
            }

            // Build array of dates to check based on enabled options
            const datesToCheck: { date: Date; offset: number; label: string }[] = []

            if (timing.sameDay) {
                datesToCheck.push({
                    date: new Date(today),
                    offset: 0,
                    label: "today"
                })
            }

            if (timing.oneDayBefore) {
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                datesToCheck.push({
                    date: tomorrow,
                    offset: 1,
                    label: "tomorrow"
                })
            }

            if (timing.twoDaysBefore) {
                const inTwoDays = new Date(today)
                inTwoDays.setDate(inTwoDays.getDate() + 2)
                datesToCheck.push({
                    date: inTwoDays,
                    offset: 2,
                    label: "in 2 days"
                })
            }

            // Check each series in watchlist
            for (const series of watchlist) {
                const nextEpisode = series.next_episode_to_air

                if (!nextEpisode || !nextEpisode.air_date) {
                    continue
                }

                const airDate = new Date(nextEpisode.air_date)
                airDate.setHours(0, 0, 0, 0)

                // Check against each enabled timing option
                for (const { date, offset, label } of datesToCheck) {
                    if (airDate.getTime() === date.getTime()) {
                        const notifiedKey = `notified-${date.toISOString().split("T")[0]}-offset-${offset}`
                        const notifiedEpisodes = JSON.parse(localStorage.getItem(notifiedKey) || "[]")

                        const episodeId = `${series.id}-${nextEpisode.season_number}-${nextEpisode.episode_number}`

                        // Skip if already notified for this timing
                        if (notifiedEpisodes.includes(episodeId)) {
                            continue
                        }

                        // Send notification
                        new Notification(`${series.name}`, {
                            body: `S${nextEpisode.season_number}E${nextEpisode.episode_number} - ${nextEpisode.name} airs ${label}!`,
                            icon: series.poster_path
                                ? `https://image.tmdb.org/t/p/w200${series.poster_path}`
                                : undefined,
                            tag: `${episodeId}-${offset}`
                        })

                        // Mark as notified for this timing
                        notifiedEpisodes.push(episodeId)
                        localStorage.setItem(notifiedKey, JSON.stringify(notifiedEpisodes))
                    }
                }
            }

            // Clean up old notification records (older than 7 days)
            const sevenDaysAgo = new Date(today)
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith("notified-")) {
                    const dateStr = key.split("-offset-")[0].replace("notified-", "")
                    const recordDate = new Date(dateStr)
                    if (recordDate < sevenDaysAgo) {
                        localStorage.removeItem(key)
                    }
                }
            }
        }

        // Check on mount
        checkNotifications()

        // Check every hour
        const interval = setInterval(checkNotifications, 60 * 60 * 1000)

        return () => clearInterval(interval)
    }, [watchlist])

    return null
}
