//Libs
import { HashRouter, Routes, Route } from "react-router-dom"

//Imports
import { WatchlistProvider } from "./context/WatchlistContext"
import { Layout } from "../ui/components/Layout"
import { SearchPage } from "../ui/pages/SearchPage"
import { DiscoverPage } from "../ui/pages/DiscoverPage"
import { WatchlistPage } from "../ui/pages/WatchlistPage"
import { CalendarPage } from "../ui/pages/CalendarPage"
import { SettingsPage } from "../ui/pages/SettingsPage"
import { NotificationCheck } from "../ui/components/NotificationCheck"

//Main
const App = () => {
  return (
    <WatchlistProvider>
      <NotificationCheck />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<SearchPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </WatchlistProvider>
  )
}

export default App
