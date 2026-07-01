//Libs
import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "node:path"
import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"

//Consts
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const userDataPath = app.getPath("userData")

//Main
app.setAppUserModelId("com.cinescope.app")

let win: BrowserWindow | null = null

function createWindow() {
  const isDev = !app.isPackaged
  const iconPath = isDev
    ? path.join(__dirname, "../../public/logo.png")
    : path.join(__dirname, "../renderer/logo.png")

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#000000",
      symbolColor: "#ffffff",
      height: 32
    },
    backgroundColor: "#000000"
  })

  win.webContents.on("did-finish-load", function () {
    win?.webContents.send("main-process-message", new Date().toLocaleString())
  })

  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"])
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"))
  }
}

//Funcs
ipcMain.handle("save-data", async function (_event, filename: string, data: any) {
  try {
    const filePath = path.join(userDataPath, filename)
    console.log(`[IPC] Saving ${filename} to ${filePath}`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    console.error(`[IPC] Error saving ${filename}:`, error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle("load-data", async function (_event, filename: string) {
  try {
    const filePath = path.join(userDataPath, filename)
    console.log(`[IPC] Loading ${filename} from ${filePath}`)
    const data = await fs.readFile(filePath, "utf-8")
    return { success: true, data: JSON.parse(data) }
  } catch (error) {
    console.log(`[IPC] File not found or error loading ${filename}:`, error)
    return { success: true, data: null }
  }
})

ipcMain.handle("export-backup", async function (_event, data: any) {
  const { filePath } = await dialog.showSaveDialog({
    title: "Export Backup",
    defaultPath: "cinescope-backup.json",
    filters: [{ name: "JSON", extensions: ["json"] }]
  })

  if (filePath) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    return { success: true, filePath }
  }
  return { success: false, error: "Cancelled" }
})

ipcMain.handle("import-backup", async function () {
  const { filePaths } = await dialog.showOpenDialog({
    title: "Import Backup",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"]
  })

  if (filePaths && filePaths.length > 0) {
    const content = await fs.readFile(filePaths[0], "utf-8")
    return { success: true, data: JSON.parse(content) }
  }
  return { success: false, error: "Cancelled" }
})

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
