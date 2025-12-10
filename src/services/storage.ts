const WATCHLIST_FILE = 'watchlist.json'
const SETTINGS_FILE = 'settings.json'

export const storage = {
    async saveWatchlist(watchlist: any[]) {
        return window.ipcRenderer.saveData(WATCHLIST_FILE, watchlist)
    },

    async loadWatchlist() {
        const response = await window.ipcRenderer.loadData(WATCHLIST_FILE)
        return response.success ? (response.data || []) : []
    },

    async saveSettings(settings: any) {
        return window.ipcRenderer.saveData(SETTINGS_FILE, settings)
    },

    async loadSettings() {
        const response = await window.ipcRenderer.loadData(SETTINGS_FILE)
        return response.success ? (response.data || {}) : {}
    },

    async exportBackup(data: { watchlist: any[]; settings: any }) {
        return window.ipcRenderer.exportBackup(data)
    },

    async importBackup() {
        return window.ipcRenderer.importBackup()
    }
}
