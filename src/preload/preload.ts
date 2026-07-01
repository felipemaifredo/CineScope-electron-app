//Libs
import { contextBridge, ipcRenderer } from "electron"

//Main
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, function (event, ...args) {
      listener(event, ...args)
    })
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  // Storage API
  saveData(filename: string, data: any) {
    return ipcRenderer.invoke("save-data", filename, data)
  },
  loadData(filename: string) {
    return ipcRenderer.invoke("load-data", filename)
  },
  exportBackup(data: any) {
    return ipcRenderer.invoke("export-backup", data)
  },
  importBackup() {
    return ipcRenderer.invoke("import-backup")
  }
})
