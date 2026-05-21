import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import './MyDogs.css'

function getDogInitial(name) {
  const trimmed = name?.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

function formatDogDetails(dog) {
  const parts = []
  if (dog.breed?.trim()) parts.push(dog.breed.trim())
  if (dog.age != null && dog.age !== '') {
    const years = Number(dog.age)
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'year' : 'years'} old`)
    }
  }
  return parts.join(' · ')
}

function dogToFormState(dog) {
  return {
    name: dog.name ?? '',
    breed: dog.breed ?? '',
    age: dog.age != null && dog.age !== '' ? String(dog.age) : '',
  }
}

function buildDogPayload(name, breed, age) {
  const trimmedBreed = breed.trim()
  const trimmedAge = age.trim()
  return {
    name: name.trim(),
    breed: trimmedBreed || null,
    age: trimmedAge === '' ? null : Number(trimmedAge),
  }
}

function MyDogs() {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', breed: '', age: '' })
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [name, setName] = useState('')
  const [breed, setBreed] = useState('')
  const [age, setAge] = useState('')

  const fetchDogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('dogs')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setDogs([])
    } else {
      setDogs(data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDogs()
  }, [fetchDogs])

  const handleAddSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to add a dog.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('dogs').insert({
      ...buildDogPayload(name, breed, age),
      user_id: user.id,
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setName('')
    setBreed('')
    setAge('')
    await fetchDogs()
    setSubmitting(false)
  }

  const startEdit = (dog) => {
    setEditingId(dog.id)
    setEditForm(dogToFormState(dog))
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', breed: '', age: '' })
  }

  const handleSaveEdit = async (dogId) => {
    if (!editForm.name.trim()) return

    setSavingId(dogId)
    setError(null)

    const { error: updateError } = await supabase
      .from('dogs')
      .update(buildDogPayload(editForm.name, editForm.breed, editForm.age))
      .eq('id', dogId)

    if (updateError) {
      setError(updateError.message)
      setSavingId(null)
      return
    }

    cancelEdit()
    await fetchDogs()
    setSavingId(null)
  }

  const handleDelete = async (dogId) => {
    setDeletingId(dogId)
    setError(null)

    const { error: mealsError } = await supabase.from('meals').delete().eq('dog_id', dogId)

    if (mealsError) {
      setError(mealsError.message)
      setDeletingId(null)
      return
    }

    const { error: deleteError } = await supabase.from('dogs').delete().eq('id', dogId)

    if (deleteError) {
      setError(deleteError.message)
      setDeletingId(null)
      return
    }

    if (editingId === dogId) cancelEdit()
    setDogs((prev) => prev.filter((dog) => dog.id !== dogId))
    setDeletingId(null)
  }

  return (
    <div className="my-dogs-page">
      <header className="my-dogs-header">
        <h1 className="my-dogs-title">My Dogs</h1>
        <p className="my-dogs-subtitle">Manage your dogs</p>
      </header>

      <section className="my-dogs-form-card">
        <form className="my-dogs-form" onSubmit={handleAddSubmit}>
          <label className="my-dogs-field">
            <span className="my-dogs-label">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dog's name"
              required
            />
          </label>
          <label className="my-dogs-field">
            <span className="my-dogs-label">Breed</span>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="my-dogs-field my-dogs-field--age">
            <span className="my-dogs-label">Age (years)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <button type="submit" className="my-dogs-btn my-dogs-btn--primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Dog'}
          </button>
        </form>
      </section>

      {error && <p className="my-dogs-error">{error}</p>}

      <section className="my-dogs-list-section">
        {loading ? (
          <p className="my-dogs-status">Loading dogs...</p>
        ) : dogs.length === 0 ? (
          <p className="my-dogs-empty">No dogs added yet</p>
        ) : (
          <ul className="my-dogs-grid">
            {dogs.map((dog) => {
              const isEditing = editingId === dog.id
              const details = formatDogDetails(dog)

              return (
                <li
                  key={dog.id}
                  className={`my-dogs-card${isEditing ? ' my-dogs-card--editing' : ''}`}
                >
                  {isEditing ? (
                    <form
                      className="my-dogs-card-edit"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSaveEdit(dog.id)
                      }}
                    >
                      <div className="my-dogs-card-header">
                        <div className="my-dogs-avatar" aria-hidden="true">
                          {getDogInitial(editForm.name)}
                        </div>
                        <div className="my-dogs-card-edit-fields">
                          <input
                            type="text"
                            className="my-dogs-input-compact"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Name"
                            aria-label="Name"
                            required
                          />
                          <input
                            type="text"
                            className="my-dogs-input-compact"
                            value={editForm.breed}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, breed: e.target.value }))
                            }
                            placeholder="Breed"
                            aria-label="Breed"
                          />
                          <input
                            type="number"
                            className="my-dogs-input-compact"
                            min="0"
                            step="1"
                            value={editForm.age}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, age: e.target.value }))
                            }
                            placeholder="Age"
                            aria-label="Age in years"
                          />
                        </div>
                      </div>
                      <div className="my-dogs-card-actions my-dogs-card-actions--compact">
                        <button
                          type="submit"
                          className="my-dogs-btn my-dogs-btn--primary my-dogs-btn--sm"
                          disabled={savingId === dog.id}
                        >
                          {savingId === dog.id ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="my-dogs-btn my-dogs-btn--ghost my-dogs-btn--sm"
                          onClick={cancelEdit}
                          disabled={savingId === dog.id}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="my-dogs-card-header">
                        <div className="my-dogs-avatar" aria-hidden="true">
                          {getDogInitial(dog.name)}
                        </div>
                        <div className="my-dogs-card-info">
                          <h2 className="my-dogs-card-name">{dog.name}</h2>
                          {details && <p className="my-dogs-card-details">{details}</p>}
                        </div>
                      </div>
                      <div className="my-dogs-card-actions">
                        <button
                          type="button"
                          className="my-dogs-btn my-dogs-btn--edit"
                          onClick={() => startEdit(dog)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="my-dogs-btn my-dogs-btn--delete"
                          onClick={() => handleDelete(dog.id)}
                          disabled={deletingId === dog.id}
                        >
                          {deletingId === dog.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default MyDogs
