import { HashRouter, Routes, Route } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { Layout } from './components/Layout';
import { SearchPage } from './pages/SearchPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationCheck } from './components/NotificationCheck';

function App() {
  return (
    <WatchlistProvider>
      <NotificationCheck />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<SearchPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </WatchlistProvider>
  );
}

export default App;
