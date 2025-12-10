import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { storage } from '../services/storage';
import { useWatchlist } from '../context/WatchlistContext';
import { setApiKey } from '../services/tmdb';

export const SettingsPage = () => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const { refreshWatchlist } = useWatchlist();

    // Load existing key on mount
    React.useEffect(() => {
        storage.loadSettings().then(settings => {
            if (settings.apiKey) setApiKeyInput(settings.apiKey);
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
        if (result && result.success) {
            alert('Restored successfully! Restart app to apply changes.');
        } else if (result && result.error && result.error !== 'Cancelled') {
            alert(`Restore failed: ${result.error}`);
        }
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
