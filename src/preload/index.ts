import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 檢查更新
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  // 安裝更新
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  // 監聽更新消息
  onUpdateMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('update-message', (_event, message) => callback(message))
  },
  // 監聽更新準備安裝
  onUpdateReady: (callback: () => void) => {
    ipcRenderer.on('update-ready-to-install', () => callback())
  },
  // 移除更新消息監聽
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-message')
    ipcRenderer.removeAllListeners('update-ready-to-install')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
