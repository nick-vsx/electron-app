import { BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let updateWindow: BrowserWindow | null = null

export function createUpdateWindow(): BrowserWindow {
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
  if (updateWindow) {
    updateWindow.webContents.send('update-message', message)
  }
}

export function closeUpdateWindow(): void {
  if (updateWindow) {
    updateWindow.close()
    updateWindow = null
  }
}