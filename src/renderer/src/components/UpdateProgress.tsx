import { useEffect, useState } from 'react'

export const UpdateProgress: React.FC = () => {
  const [message, setMessage] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    // 監聽更新消息
    window.api.onUpdateMessage((text: string) => {
      setMessage(text)
      
      // 解析下載進度
      if (text.includes('Downloaded')) {
        const match = text.match(/Downloaded (\d+)/)
        if (match) {
          setProgress(parseInt(match[1]))
        }
      }

      // 檢查是否下載完成
      if (text.includes('Update downloaded')) {
        setShowInstallButton(true)
      }
    })

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

  return (
    <div className="update-container">
      <h2>Software Update</h2>
      <div className="message">{message}</div>
      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{progress}%</div>
        </div>
      )}
      {showInstallButton && (
        <button className="install-button" onClick={handleInstall}>
          Install and Restart
        </button>
      )}
    </div>
  )
}
