import { useEffect, useState } from 'react'

export const UpdateNotification: React.FC = () => {
  const [message, setMessage] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    // 檢查更新
    const checkForUpdates = async () => {
      try {
        await window.api.checkForUpdates()
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }

    // 監聽更新消息
    window.api.onUpdateMessage((text: string) => {
      console.log('Update message:', text)
      setMessage(text)

      // 解析下載進度
      if (text.includes('Downloaded')) {
        const match = text.match(/Downloaded ([\d.]+)%/)
        if (match) {
          const progressValue = parseFloat(match[1])
          setProgress(progressValue)
        }
      }

      // 檢查是否下載完成
      if (text.includes('Update downloaded')) {
        setShowInstallButton(true)
      }

      // 如果是最新版本，隱藏進度條
      if (text.includes('Already on the latest version')) {
        setProgress(0)
        setTimeout(() => {
          setMessage('')
        }, 3000)
      }

      // 如果發生錯誤，隱藏進度條
      if (text.includes('Error')) {
        setProgress(0)
        setTimeout(() => {
          setMessage('')
        }, 3000)
      }
    })

    // 組件掛載時檢查更新
    checkForUpdates()

    // 組件卸載時清理監聽器
    return () => {
      window.api.removeUpdateListeners()
    }
  }, [])

  const handleInstall = async () => {
    try {
      await window.api.quitAndInstall()
    } catch (error) {
      console.error('Failed to install update:', error)
    }
  }

  if (!message) {
    return null
  }

  return (
    <div className="update-notification">
      <div className="update-message">
        {message}
      </div>
      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{progress.toFixed(1)}%</div>
        </div>
      )}
      {showInstallButton && (
        <button className="install-button" onClick={handleInstall}>
          Install and Restart
        </button>
      )}

      <style>{`
        .update-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 300px;
          z-index: 1000;
        }

        .update-message {
          margin-bottom: 10px;
          font-size: 14px;
          color: #333;
        }

        .progress-container {
          margin: 10px 0;
        }

        .progress-bar {
          height: 4px;
          background: #eee;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #2196f3;
          transition: width 0.3s ease;
        }

        .progress-text {
          margin-top: 5px;
          text-align: right;
          font-size: 12px;
          color: #666;
        }

        .install-button {
          width: 100%;
          padding: 8px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .install-button:hover {
          background: #1976d2;
        }
      `}</style>
    </div>
  )
}
