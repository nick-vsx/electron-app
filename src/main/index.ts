import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import icon from '../../resources/icon.png?asset'

// 配置日誌
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

let mainWindow: BrowserWindow | null = null

// 更新事件處理
function sendStatusToWindow(text: string): void {
  log.info(text)
  if (mainWindow) {
    mainWindow.webContents.send('update-message', text)
  }
}

// 設置自動更新事件監聽
function setupAutoUpdater(): void {
  // 檢查更新時
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for updates...')
  })

  // 有可用更新時
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow(`Update available: ${info.version}`)
  })

  // 無可用更新時
  autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('Already on the latest version.')
  })

  // 更新發生錯誤時
  autoUpdater.on('error', (err) => {
    sendStatusToWindow(`Error in auto-updater: ${err.message}`)
  })

  // 更新下載進度
  autoUpdater.on('download-progress', (progressObj) => {
    sendStatusToWindow(
      `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    )
  })

  // 更新下載完成時
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow(`Update downloaded. Version: ${info.version}`)
    mainWindow?.webContents.send('update-ready-to-install')
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // 在開發環境下不檢查更新
    if (!is.dev) {
      // 延遲 3 秒檢查更新，確保渲染進程已完全加載
      setTimeout(() => {
        log.info('Checking for updates...')
        autoUpdater.checkForUpdates().catch((err) => {
          log.error('Error checking for updates:', err)
        })
      }, 3000)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 開發環境下不檢查更新
  if (!is.dev) {
    // 檢查更新
    autoUpdater.checkForUpdates()
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // 設置自動更新
  setupAutoUpdater()

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 添加 IPC 處理程序
  ipcMain.handle('check-for-updates', () => {
    if (!is.dev) {
      return autoUpdater.checkForUpdates()
    }
  })

  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall()
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})