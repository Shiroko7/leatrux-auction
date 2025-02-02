import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import OBR from '@owlbear-rodeo/sdk'
import { setupContextMenu } from './contextMenu'
import './index.css'

OBR.onReady(() => {
  setupContextMenu();
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
