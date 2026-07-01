//Libs
import { useEffect } from "react"

//Imports
import { useWatchlist } from "../../App/context/WatchlistContext"
import { storage } from "../../Lib/utils/storage"

//Main
export const NotificationCheck = () => {
  const { watchlist } = useWatchlist()

  useEffect(function () {
    async function checkNotifications() {
      const settings = await storage.loadSettings()

      if (!settings.notificationsEnabled) {
        return
      }

      if (Notification.permission === "default") {
        await Notification.requestPermission()
      }

      if (Notification.permission !== "granted") {
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const timing = settings.notificationTiming || {
        sameDay: true,
        oneDayBefore: false,
        twoDaysBefore: false
      }

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

      for (const series of watchlist) {
        const nextEpisode = series.next_episode_to_air

        if (!nextEpisode || !nextEpisode.air_date) {
          continue
        }

        const airDate = new Date(nextEpisode.air_date)
        airDate.setHours(0, 0, 0, 0)

        for (const { date, offset, label } of datesToCheck) {
          if (airDate.getTime() === date.getTime()) {
            const notifiedKey = `notified-${date.toISOString().split("T")[0]}-offset-${offset}`
            const notifiedEpisodes = JSON.parse(localStorage.getItem(notifiedKey) || "[]")

            const episodeId = `${series.id}-${nextEpisode.season_number}-${nextEpisode.episode_number}`

            if (notifiedEpisodes.includes(episodeId)) {
              continue
            }

            new Notification(`${series.name}`, {
              body: `S${nextEpisode.season_number}E${nextEpisode.episode_number} - ${nextEpisode.name} airs ${label}!`,
              icon: series.poster_path
                ? `https://image.tmdb.org/t/p/w200${series.poster_path}`
                : undefined,
              tag: `${episodeId}-${offset}`
            })

            notifiedEpisodes.push(episodeId)
            localStorage.setItem(notifiedKey, JSON.stringify(notifiedEpisodes))
          }
        }
      }

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

    checkNotifications()

    const interval = setInterval(checkNotifications, 60 * 60 * 1000)

    return function () {
      clearInterval(interval)
    }
  }, [watchlist])

  return null
}
