import { useRef, useState } from 'react'

const API_URL = `${import.meta.env.VITE_API_URL}/check-ingredients`

function CameraIcon() {
  return (
    <svg className="dropzone-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M8 14h6l3-4h14l3 4h6a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="26" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ImageUploader({ onResult }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const selectFile = (file) => {
    if (!file?.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setError(null)
    setSelectedFile(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) selectFile(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    if (!loading) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    if (loading) return
    const file = event.dataTransfer.files?.[0]
    if (file) selectFile(file)
  }

  const handleAnalyze = async () => {
    if (!selectedFile || loading) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze ingredients')
      }

      onResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="image-uploader">
      <div
        className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${loading ? 'dropzone-disabled' : ''}`}
        onClick={() => !loading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Drop an ingredient label here"
      >
        <CameraIcon />
        <p className="dropzone-title">Drop an ingredient label here</p>
        <p className="dropzone-hint">
          Snap a photo or upload from your device — we&apos;ll check every ingredient for your pup
        </p>
      </div>

      <div className="upload-secondary">
        <button
          type="button"
          className="text-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          Browse files
        </button>
        <span className="upload-divider">/</span>
        <button
          type="button"
          className="text-btn"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
        >
          Camera
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFileChange}
      />

      {previewUrl && (
        <div className="preview-card">
          <img src={previewUrl} alt="Uploaded ingredient label" />
        </div>
      )}

      <button
        type="button"
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={!selectedFile || loading}
      >
        {loading ? 'Analyzing...' : 'Analyze Ingredients'}
      </button>

      {error && <p className="error">{error}</p>}
    </section>
  )
}

export default ImageUploader
