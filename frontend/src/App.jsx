import { useState } from 'react'
import ImageUploader from './components/ImageUploader.jsx'
import Results from './components/Results.jsx'
import './App.css'

function App() {
  const [result, setResult] = useState(null)

  return (
    <div className="app-shell">
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
    </div>
  )
}

export default App
