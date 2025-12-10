import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ ├─┬─ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── assets
// │ └── ...

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(process.env.VITE_PUBLIC || '', 'logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hidden', // Premium look with custom titlebar potential
        titleBarOverlay: {
            color: '#000000',
            symbolColor: '#ffffff',
            height: 32
        },
        backgroundColor: '#000000' // Dark theme base
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
        win.webContents.openDevTools()
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }
}

// IPC Handlers
const userDataPath = app.getPath('userData')

ipcMain.handle('save-data', async (_event, filename: string, data: any) => {
    try {
        const filePath = path.join(userDataPath, filename)
        console.log(`[IPC] Saving ${filename} to ${filePath}`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
        return { success: true }
    } catch (error) {
        console.error(`[IPC] Error saving ${filename}:`, error);
        return { success: false, error: (error as Error).message }
    }
})

ipcMain.handle('load-data', async (_event, filename: string) => {
    try {
        const filePath = path.join(userDataPath, filename)
        console.log(`[IPC] Loading ${filename} from ${filePath}`);
        const data = await fs.readFile(filePath, 'utf-8')
        return { success: true, data: JSON.parse(data) }
    } catch (error) {
        // If file doesn't exist, return null data but success
        console.log(`[IPC] File not found or error loading ${filename}:`, error);
        return { success: true, data: null }
    }
})

ipcMain.handle('export-backup', async (_event, data: any) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export Backup',
        defaultPath: 'cinescope-backup.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (filePath) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
        return { success: true, filePath }
    }
    return { success: false, error: 'Cancelled' }
})

ipcMain.handle('import-backup', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Backup',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    })

    if (filePaths && filePaths.length > 0) {
        const content = await fs.readFile(filePaths[0], 'utf-8')
        return { success: true, data: JSON.parse(content) }
    }
    return { success: false, error: 'Cancelled' }
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(createWindow)
