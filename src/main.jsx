import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './styles/index.css'
import '../zoom-styles.css'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Editor = lazy(() => import('./pages/Editor.jsx'));

const LoadingFallback = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Loading...</p>
        </div>
    </div>
);

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <HashRouter>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/editor" element={<Editor />} />
                    </Routes>
                </Suspense>
            </HashRouter>
        </ErrorBoundary>
    </React.StrictMode>,
)
