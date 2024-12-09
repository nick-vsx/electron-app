import { useEffect, useState } from 'react'

export const UpdateNotification: React.FC = () => {
  const [message, setMessage] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [error, setError] = useState<string>('')
  const [isRetrying, setIsRetrying] = useState(false)

  const checkForUpdates = async () => {
    try {
      setError('')
      setIsRetrying(true)
      const result = await window.api.checkForUpdates()
      if (result && !result.success) {
        setError(result.error || 'Failed to check for updates')
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      setError('Failed to check for updates. Please try again.')
    } finally {
      setIsRetrying(false)
    }
  }

  useEffect(() => {
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
        setError('')
      }

      // 如果是最新版本，隱藏進度條
      if (text.includes('Already on the latest version')) {
        setProgress(0)
        setTimeout(() => {
          setMessage('')
          setError('')
        }, 3000)
      }

      // 如果發生錯誤，設置錯誤狀態
      if (text.includes('Error in auto-updater')) {
        setProgress(0)
        setError(text)
        setShowInstallButton(false)
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
      setError('Failed to install update. Please try again.')
    }
  }

  const handleRetry = () => {
    checkForUpdates()
  }

  // 如果沒有消息且沒有錯誤，不渲染組件
  if (!message && !error) {
    return null
  }

  return (
    <div className="update-notification">
      {message && !error && (
        <div className="update-message">
          {message}
        </div>
      )}
      {error && (
        <div className="error-container">
          <div className="error-message">
            {error}
          </div>
          <button 
            className="retry-button" 
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? 'Checking...' : 'Try Again'}
          </button>
        </div>
      )}
      {progress > 0 && !error && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{progress.toFixed(1)}%</div>
        </div>
      )}
      {showInstallButton && !error && (
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

        .error-container {
          margin-bottom: 10px;
        }

        .error-message {
          font-size: 14px;
          color: #f44336;
          margin-bottom: 10px;
        }

        .retry-button {
          padding: 6px 12px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.3s ease;
        }

        .retry-button:hover {
          background: #d32f2f;
        }

        .retry-button:disabled {
          background: #ccc;
          cursor: not-allowed;
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
