import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Import test utilities in development
if (import.meta.env.DEV) {
    import('./utils/testBackendConnection')
    import('./utils/debugUserAuthority')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
