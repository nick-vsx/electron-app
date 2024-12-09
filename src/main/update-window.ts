import { BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let updateWindow: BrowserWindow | null = null

export function createUpdateWindow(): BrowserWindow {
  // 如果窗口已存在，直接返回
  if (updateWindow) {
    return updateWindow
  }

  updateWindow = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    updateWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/update.html`)
  } else {
    updateWindow.loadFile(join(__dirname, '../renderer/update.html'))
  }

  updateWindow.once('ready-to-show', () => {
    if (updateWindow) updateWindow.show()
  })

  updateWindow.on('closed', () => {
    updateWindow = null
  })

  return updateWindow
}

export function sendUpdateMessage(message: string): void {
  // 如果窗口不存在，創建一個新窗口
  if (!updateWindow) {
    createUpdateWindow()
  }
  
  // 確保窗口已經準備好接收消息
  if (updateWindow?.webContents) {
    updateWindow.webContents.send('update-message', message)
  }
}

export function closeUpdateWindow(): void {
  if (updateWindow) {
    updateWindow.close()
    updateWindow = null
  }
}

// 檢查更新窗口是否存在
export function isUpdateWindowOpen(): boolean {
  return updateWindow !== null
}

// 顯示更新窗口
export function showUpdateWindow(): void {
  if (updateWindow) {
    updateWindow.show()
  } else {
    createUpdateWindow()
  }
}

// 隱藏更新窗口
export function hideUpdateWindow(): void {
  if (updateWindow) {
    updateWindow.hide()
  }
}
