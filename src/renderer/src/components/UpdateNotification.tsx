import { useEffect, useState } from 'react'

export const UpdateNotification: React.FC = () => {
  const [updateMessage, setUpdateMessage] = useState<string>('')
  const [showUpdateButton, setShowUpdateButton] = useState(false)

  useEffect(() => {
    // 監聽更新消息
    window.api.onUpdateMessage((message) => {
      setUpdateMessage(message)
    })

    // 監聽更新準備安裝
    window.api.onUpdateReady(() => {
      setShowUpdateButton(true)
    })

    return () => {
      window.api.removeUpdateListeners()
    }
  }, [])

  const handleCheckUpdate = async () => {
    try {
      await window.api.checkForUpdates()
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }

  const handleUpdate = async () => {
    try {
      await window.api.quitAndInstall()
    } catch (error) {
      console.error('Failed to install update:', error)
    }
  }

  return (
    <div className="update-notification">
      {updateMessage && (
        <div className="update-message">
          {updateMessage}
        </div>
      )}
      <div className="update-actions">
        <button onClick={handleCheckUpdate}>
          Check for Updates
        </button>
        {showUpdateButton && (
          <button onClick={handleUpdate}>
            Restart and Install Update
          </button>
        )}
      </div>

      <style>{`
        .update-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\
          max-width: 300px;
          color: #444;
        }

        .update-message {
          margin-bottom: 10px;
          font-size: 14px;
        }

        .update-actions {
          display: flex;
          gap: 10px;
        }

        .update-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: #007bff;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }

        .update-actions button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  )
}
