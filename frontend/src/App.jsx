import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ImageUploader from './components/ImageUploader.jsx'
import Results from './components/Results.jsx'
import DailyLog from './pages/DailyLog.jsx'
import './App.css'

function IngredientCheckerPage() {
  const [result, setResult] = useState(null)

  return (
    <div className="layout-grid">
      <div className="column column-upload">
        <header className="app-header">
          <h1 className="app-title">
            Paw Check <span className="app-emoji" aria-hidden="true">🐾</span>
          </h1>
        </header>
        <div className="upload-panel">
          <ImageUploader onResult={setResult} />
        </div>
      </div>

      <div className="column column-results">
        <Results result={result} />
      </div>
    </div>
  )
}

function AppMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const navigateTo = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <header className="app-menu-bar">
      <div className="app-menu" ref={menuRef}>
        <button
          type="button"
          className="app-menu-trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="true"
        >
          Paw Check <span className="app-emoji" aria-hidden="true">🐾</span>
        </button>

        {open && (
          <div className="app-menu-dropdown" role="menu">
            <button
              type="button"
              role="menuitem"
              className={`app-menu-item${location.pathname === '/' ? ' app-menu-item-active' : ''}`}
              onClick={() => navigateTo('/')}
            >
              Daily Log
            </button>
            <button
              type="button"
              role="menuitem"
              className={`app-menu-item${location.pathname === '/checker' ? ' app-menu-item-active' : ''}`}
              onClick={() => navigateTo('/checker')}
            >
              Ingredient Checker
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function AppShell() {
  return (
    <div className="app-shell">
      <AppMenu />
      <Routes>
        <Route path="/" element={<DailyLog />} />
        <Route path="/checker" element={<IngredientCheckerPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
