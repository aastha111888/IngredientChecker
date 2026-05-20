import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import './DailyLog.css'

const TIME_OF_DAY_ORDER = ['morning', 'afternoon', 'evening']

const TIME_OF_DAY_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

function getTimeOfDay(date) {
  const hour = date.getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function formatDateHeading(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function groupMealsByDateAndTime(meals) {
  const byDate = new Map()

  for (const meal of meals) {
    const eatenAt = new Date(meal.eaten_at)
    const dateKey = eatenAt.toLocaleDateString('en-CA')

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        date: eatenAt,
        periods: { morning: [], afternoon: [], evening: [] },
      })
    }

    byDate.get(dateKey).periods[getTimeOfDay(eatenAt)].push(meal)
  }

  return Array.from(byDate.values())
    .sort((a, b) => b.date - a.date)
    .map((group) => ({
      ...group,
      periods: TIME_OF_DAY_ORDER.map((period) => ({
        key: period,
        label: TIME_OF_DAY_LABELS[period],
        meals: group.periods[period].sort(
          (a, b) => new Date(b.eaten_at) - new Date(a.eaten_at),
        ),
      })).filter((period) => period.meals.length > 0),
    }))
    .filter((group) => group.periods.length > 0)
}

function DailyLog() {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [foodName, setFoodName] = useState('')
  const [portionSize, setPortionSize] = useState('')
  const [eatenAt, setEatenAt] = useState(toDatetimeLocalValue(new Date()))

  const fetchMeals = useCallback(async () => {
    setLoading(true)
    setError(null)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const { data, error: fetchError } = await supabase
      .from('meals')
      .select('*')
      .gte('eaten_at', sevenDaysAgo.toISOString())
      .order('eaten_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setMeals([])
    } else {
      setMeals(data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  const groupedMeals = useMemo(() => groupMealsByDateAndTime(meals), [meals])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!foodName.trim() || !portionSize.trim() || !eatenAt) return

    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('meals').insert({
      food_name: foodName.trim(),
      portion_size: portionSize.trim(),
      eaten_at: new Date(eatenAt).toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setFoodName('')
    setPortionSize('')
    setEatenAt(toDatetimeLocalValue(new Date()))
    await fetchMeals()
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    setError(null)
    const { error: deleteError } = await supabase.from('meals').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setMeals((prev) => prev.filter((meal) => meal.id !== id))
  }

  return (
    <div className="daily-log-page">
      <header className="daily-log-header">
        <h1 className="daily-log-title">
          Daily Log <span className="app-emoji" aria-hidden="true">🐾</span>
        </h1>
        <p className="daily-log-subtitle">Track what your dog ate over the last 7 days</p>
      </header>

      <section className="daily-log-card">
        <h2 className="daily-log-section-title">Add a meal</h2>
        <form className="meal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Food name</span>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Chicken & rice kibble"
              required
            />
          </label>
          <label className="form-field">
            <span>Portion size</span>
            <input
              type="text"
              value={portionSize}
              onChange={(e) => setPortionSize(e.target.value)}
              placeholder="e.g. 1 cup"
              required
            />
          </label>
          <label className="form-field">
            <span>When eaten</span>
            <input
              type="datetime-local"
              value={eatenAt}
              onChange={(e) => setEatenAt(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="meal-submit-btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Meal'}
          </button>
        </form>
      </section>

      {error && <p className="daily-log-error">{error}</p>}

      <section className="daily-log-list-section">
        {loading ? (
          <p className="daily-log-loading">Loading meals...</p>
        ) : groupedMeals.length === 0 ? (
          <p className="daily-log-empty">No meals logged yet</p>
        ) : (
          groupedMeals.map((dayGroup) => (
            <div key={dayGroup.date.toISOString()} className="day-group">
              <h2 className="day-group-title">{formatDateHeading(dayGroup.date)}</h2>
              {dayGroup.periods.map((period) => (
                <div key={period.key} className="time-group">
                  <h3 className="time-group-title">{period.label}</h3>
                  <ul className="meal-entries">
                    {period.meals.map((meal) => (
                      <li key={meal.id} className="meal-entry">
                        <div className="meal-entry-body">
                          <p className="meal-entry-name">{meal.food_name}</p>
                          <p className="meal-entry-meta">
                            {meal.portion_size} · {formatTime(new Date(meal.eaten_at))}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="meal-delete-btn"
                          onClick={() => handleDelete(meal.id)}
                          aria-label={`Delete ${meal.food_name}`}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default DailyLog
