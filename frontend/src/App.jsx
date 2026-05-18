import { useState } from 'react'
import ImageUploader from './components/ImageUploader.jsx'
import Results from './components/Results.jsx'
import './App.css'

function App() {
  const [result, setResult] = useState(null)

  return (
    <main className="app">
      <h1>Ingredient Checker</h1>
      <ImageUploader onResult={setResult} />
      <Results result={result} />
    </main>
  )
}

export default App
