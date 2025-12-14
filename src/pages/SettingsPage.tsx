import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { storage } from '../services/storage';
import { useWatchlist } from '../context/WatchlistContext';
import { setApiKey } from '../services/tmdb';

export const SettingsPage = () => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationTiming, setNotificationTiming] = useState({
        sameDay: true,
        oneDayBefore: false,
        twoDaysBefore: false
    });
    const { refreshWatchlist } = useWatchlist();

    // Load existing settings on mount
    React.useEffect(() => {
        storage.loadSettings().then(settings => {
            if (settings.apiKey) setApiKeyInput(settings.apiKey);
            if (settings.notificationsEnabled !== undefined) {
                setNotificationsEnabled(settings.notificationsEnabled);
            }
            if (settings.notificationTiming) {
                setNotificationTiming(settings.notificationTiming);
            } else {
                // Default: same day only
                setNotificationTiming({
                    sameDay: true,
                    oneDayBefore: false,
                    twoDaysBefore: false
                });
            }
        });
    }, []);

    const handleSaveApiKey = async () => {
        const result = await storage.saveSettings({ apiKey: apiKeyInput });
        if (result.success) {
            setApiKey(apiKeyInput); // Update memory
            await refreshWatchlist(); // Reload data if needed
            alert('API Key saved!');
        } else {
            alert(`Failed to save API Key: ${result.error}`);
        }
    };

    const handleBackup = async () => {
        // Demo implementation
        const watchlist = await storage.loadWatchlist();
        const settings = await storage.loadSettings(); // Load current settings for backup
        const result = await storage.exportBackup({ watchlist, settings: { apiKey: settings.apiKey } });
        if (result.success) {
            alert(`Backup exported to: ${result.filePath}`);
        } else {
            if (result.error !== 'Cancelled') {
                alert(`Backup failed: ${result.error}`);
            }
        }
    };

    const handleRestore = async () => {
        const result = await storage.importBackup();
        if (result && result.success && result.data) {
            try {
                // Apply imported data
                if (result.data.watchlist) {
                    await storage.saveWatchlist(result.data.watchlist);
                }

                if (result.data.settings) {
                    await storage.saveSettings(result.data.settings);
                    // Update local state if API key exists
                    if (result.data.settings.apiKey) {
                        setApiKeyInput(result.data.settings.apiKey);
                        setApiKey(result.data.settings.apiKey);
                    }
                }

                // Refresh app state
                await refreshWatchlist();
                alert('Backup imported successfully!');
            } catch (error) {
                console.error("Error applying backup:", error);
                alert('Failed to apply backup data.');
            }
        } else if (result && result.error && result.error !== 'Cancelled') {
            alert(`Restore failed: ${result.error}`);
        }
    };

    const handleSaveNotifications = async () => {
        const settings = await storage.loadSettings();
        const result = await storage.saveSettings({
            ...settings,
            notificationsEnabled,
            notificationTiming
        });
        if (result.success) {
            alert('Notification settings saved!');
        } else {
            alert(`Failed to save settings: ${result.error}`);
        }
    };

    const handleTestNotification = async () => {
        // Request permission if needed
        if (Notification.permission === "default") {
            await Notification.requestPermission();
        }

        if (Notification.permission !== "granted") {
            alert("Please grant notification permission first!");
            return;
        }

        // Mock series data
        const mockSeries = {
            name: "Breaking Bad",
            poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg"
        };

        const mockEpisode = {
            season_number: 5,
            episode_number: 16,
            name: "Felina"
        };

        // Send test notifications based on enabled timing options
        const timings = [];
        if (notificationTiming.sameDay) timings.push("today");
        if (notificationTiming.oneDayBefore) timings.push("tomorrow");
        if (notificationTiming.twoDaysBefore) timings.push("in 2 days");

        if (timings.length === 0) {
            alert("Please enable at least one notification timing option!");
            return;
        }

        timings.forEach((timing, index) => {
            setTimeout(() => {
                new Notification(`${mockSeries.name}`, {
                    body: `S${mockEpisode.season_number}E${mockEpisode.episode_number} - ${mockEpisode.name} airs ${timing}!`,
                    icon: `https://image.tmdb.org/t/p/w200${mockSeries.poster_path}`,
                    tag: `test-${timing}`
                });
            }, index * 500); // Stagger notifications by 500ms
        });

        alert(`Sent ${timings.length} test notification(s)!`);
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="space-y-4 rounded-xl border border-zinc-800 p-6 bg-zinc-900/30">
                <h2 className="text-xl font-semibold">API Configuration</h2>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">TMDb API Key</label>
                    <div className="flex gap-2">
                        <Input
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="Enter valid TMDb API Key"
                        />
                        <Button onClick={handleSaveApiKey}>Save</Button>
                    </div>
                    <p className="text-xs text-zinc-500">
                        Required to fetch metadata. Get one at <a href="https://www.themoviedb.org/settings/api" target="_blank" className="text-indigo-400 hover:underline">themoviedb.org</a>
                    </p>
                </div>
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-800 p-6 bg-zinc-900/30">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="notifications-enabled"
                            checked={notificationsEnabled}
                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                        />
                        <label htmlFor="notifications-enabled" className="text-sm font-medium text-zinc-300">
                            Enable episode notifications
                        </label>
                    </div>

                    {notificationsEnabled && (
                        <div className="space-y-2 pl-7">
                            <label className="text-sm font-medium text-zinc-400">Notify me:</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="same-day"
                                        checked={notificationTiming.sameDay}
                                        onChange={(e) => setNotificationTiming({
                                            ...notificationTiming,
                                            sameDay: e.target.checked
                                        })}
                                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="same-day" className="text-sm text-zinc-300">
                                        On the day of release
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="one-day-before"
                                        checked={notificationTiming.oneDayBefore}
                                        onChange={(e) => setNotificationTiming({
                                            ...notificationTiming,
                                            oneDayBefore: e.target.checked
                                        })}
                                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="one-day-before" className="text-sm text-zinc-300">
                                        1 day before
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="two-days-before"
                                        checked={notificationTiming.twoDaysBefore}
                                        onChange={(e) => setNotificationTiming({
                                            ...notificationTiming,
                                            twoDaysBefore: e.target.checked
                                        })}
                                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="two-days-before" className="text-sm text-zinc-300">
                                        2 days before
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="flex gap-2">
                        <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                        {import.meta.env.DEV && (
                            <Button variant="secondary" onClick={handleTestNotification}>
                                Test Notifications
                            </Button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-zinc-500">
                    Get notified when new episodes of your tracked series are about to air.
                </p>
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-800 p-6 bg-zinc-900/30">
                <h2 className="text-xl font-semibold">Data Management</h2>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={handleBackup}>
                        Export Backup
                    </Button>
                    <Button variant="secondary" onClick={handleRestore}>
                        Import Backup
                    </Button>
                </div>
                <p className="text-sm text-zinc-500">
                    Save your watchlist to a JSON file or restore from a previous backup.
                </p>
            </div>
        </div>
    );
};
