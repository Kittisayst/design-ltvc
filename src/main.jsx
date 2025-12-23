import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CanvasProvider } from './context/CanvasContext.jsx';
import '../style.css'
import '../zoom-styles.css'

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <CanvasProvider>
            <App />
        </CanvasProvider>
    </React.StrictMode>,
)
