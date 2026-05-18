import { useRef, useState } from 'react'

const API_URL = 'http://localhost:8080/check-ingredients'

function ImageUploader({ onResult }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    setSelectedFile(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleCheckIngredients = async () => {
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
        throw new Error(data.message || 'Failed to check ingredients')
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
      <div className="upload-actions">
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          Choose from device
        </button>
        <button
          type="button"
          className="upload-btn"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
        >
          Take photo
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
        <div className="preview">
          <img src={previewUrl} alt="Uploaded ingredient label" />
        </div>
      )}

      <button
        type="button"
        className="check-btn"
        onClick={handleCheckIngredients}
        disabled={!selectedFile || loading}
      >
        Check Ingredients
      </button>

      {loading && <p className="loading">Checking ingredients...</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}

export default ImageUploader
