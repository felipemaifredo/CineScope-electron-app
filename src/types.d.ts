export interface IpcRenderer {
    saveData: (filename: string, data: any) => Promise<{ success: boolean; error?: string }>
    loadData: (filename: string) => Promise<{ success: boolean; data?: any }>
    exportBackup: (data: any) => Promise<{ success: boolean; filePath?: string; error?: string }>
    importBackup: () => Promise<{ success: boolean; data?: any; error?: string }>
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
    off: (channel: string, listener: (...args: any[]) => void) => void
    send: (channel: string, ...args: any[]) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
}

declare global {
    interface Window {
        ipcRenderer: IpcRenderer
    }
}
