import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import ImageUploader from './components/ImageUploader.jsx'
import Results from './components/Results.jsx'
import DailyLog from './pages/DailyLog.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import MyDogs from './pages/MyDogs.jsx'
import { supabase } from './supabaseClient.js'
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

function AppMenu({ dogs, selectedDog, onSelectDog, onSignOut }) {
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

  const handleDogChange = (event) => {
    const dogId = event.target.value
    if (!dogId) {
      onSelectDog(null)
      return
    }
    const dog = dogs.find((d) => d.id === dogId)
    onSelectDog(dog ?? null)
  }

  const handleSignOut = async () => {
    setOpen(false)
    await onSignOut()
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
              Home
            </button>
            <button
              type="button"
              role="menuitem"
              className={`app-menu-item${location.pathname === '/log' ? ' app-menu-item-active' : ''}`}
              onClick={() => navigateTo('/log')}
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
            <button
              type="button"
              role="menuitem"
              className={`app-menu-item${location.pathname === '/dogs' ? ' app-menu-item-active' : ''}`}
              onClick={() => navigateTo('/dogs')}
            >
              My Dogs
            </button>
            <button
              type="button"
              role="menuitem"
              className="app-menu-item app-menu-item--logout"
              onClick={handleSignOut}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      <label className="app-dog-select-wrap">
        <span className="visually-hidden">Select a dog</span>
        <select
          className="app-dog-select"
          value={selectedDog?.id ?? ''}
          onChange={handleDogChange}
          aria-label="Select a dog"
        >
          <option value="">Select a dog</option>
          {dogs.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </label>
    </header>
  )
}

function resolveSelectedDog(list, prev) {
  if (list.length === 0) return null
  if (prev && list.some((dog) => dog.id === prev.id)) return prev
  return list[0]
}

function AuthenticatedApp() {
  const [dogs, setDogs] = useState([])
  const [dogsReady, setDogsReady] = useState(false)
  const [selectedDog, setSelectedDog] = useState(null)
  const location = useLocation()

  const fetchDogs = useCallback(async () => {
    const { data } = await supabase.from('dogs').select('*').order('name', { ascending: true })
    const list = data ?? []
    setDogs(list)
    setSelectedDog((prev) => resolveSelectedDog(list, prev))
    setDogsReady(true)
  }, [])

  useEffect(() => {
    fetchDogs()
  }, [fetchDogs, location.pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="app-shell">
      <AppMenu
        dogs={dogs}
        selectedDog={selectedDog}
        onSelectDog={setSelectedDog}
        onSignOut={handleSignOut}
      />
      <Routes>
        <Route path="/" element={<Landing isLoggedIn />} />
        <Route
          path="/log"
          element={<DailyLog dogs={dogs} dogsReady={dogsReady} selectedDog={selectedDog} />}
        />
        <Route path="/checker" element={<IngredientCheckerPage />} />
        <Route path="/dogs" element={<MyDogs />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function UnauthenticatedApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Landing isLoggedIn={false} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppShell() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!authReady) {
    return <div className="auth-loading">Loading...</div>
  }

  if (!session) {
    return <UnauthenticatedApp />
  }

  return <AuthenticatedApp />
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
