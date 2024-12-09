import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      checkForUpdates: () => Promise<{ success: boolean; error?: string }>
      quitAndInstall: () => Promise<void>
      onUpdateMessage: (callback: (message: string) => void) => void
      removeUpdateListeners: () => void
      getVersion: () => Promise<string>
    }
  }
}
