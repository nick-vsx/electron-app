import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      checkForUpdates: () => Promise<void>
      quitAndInstall: () => Promise<void>
      onUpdateMessage: (callback: (message: string) => void) => void
      removeUpdateListeners: () => void
    }
  }
}
