import React from 'react'
import ReactDOM from 'react-dom/client'
import { UpdateProgress } from './components/UpdateProgress'
import './assets/update.css'

ReactDOM.createRoot(document.getElementById('update-root') as HTMLElement).render(
  <React.StrictMode>
    <UpdateProgress />
  </React.StrictMode>
)