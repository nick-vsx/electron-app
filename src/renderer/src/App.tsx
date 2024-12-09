import { useEffect, useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): JSX.Element {
  const [version, setVersion] = useState<string>('')
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  useEffect(() => {
    // 獲取應用版本號
    window.api.getVersion().then((ver) => {
      setVersion(ver)
    })
  }, [])

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Current Version : <code>v{version}</code>
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
