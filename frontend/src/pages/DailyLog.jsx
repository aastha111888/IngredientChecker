import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import './DailyLog.css'

const TIME_OF_DAY_ORDER = ['morning', 'afternoon', 'evening']

const TIME_OF_DAY_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

const DAYS_IN_VIEW = 7

function getTimeOfDay(date) {
  const hour = date.getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatFriendlyDate(date) {
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

function formatTime12Hour(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function buildWeekColumns(meals) {
  const mealsByDateKey = new Map()

  for (const meal of meals) {
    const dateKey = new Date(meal.eaten_at).toLocaleDateString('en-CA')
    if (!mealsByDateKey.has(dateKey)) {
      mealsByDateKey.set(dateKey, [])
    }
    mealsByDateKey.get(dateKey).push(meal)
  }

  const today = startOfDay(new Date())
  const columns = []

  for (let i = 0; i < DAYS_IN_VIEW; i++) {
    const dayDate = new Date(today)
    dayDate.setDate(today.getDate() - i)
    const dateKey = dayDate.toLocaleDateString('en-CA')
    const dayMeals = mealsByDateKey.get(dateKey) ?? []

    const periods = { morning: [], afternoon: [], evening: [] }
    for (const meal of dayMeals) {
      periods[getTimeOfDay(new Date(meal.eaten_at))].push(meal)
    }

    columns.push({
      date: dayDate,
      dateKey,
      label: formatFriendlyDate(dayDate),
      hasMeals: dayMeals.length > 0,
      periods: TIME_OF_DAY_ORDER.map((period) => ({
        key: period,
        label: TIME_OF_DAY_LABELS[period],
        meals: periods[period].sort(
          (a, b) => new Date(b.eaten_at) - new Date(a.eaten_at),
        ),
      })),
    })
  }

  return columns
}

function DailyLog({ dogs, dogsReady, selectedDog }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [foodName, setFoodName] = useState('')
  const [portionSize, setPortionSize] = useState('')
  const [eatenAt, setEatenAt] = useState(toDatetimeLocalValue(new Date()))

  const fetchMeals = useCallback(async () => {
    if (!selectedDog) {
      setMeals([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const rangeStart = new Date()
    rangeStart.setDate(rangeStart.getDate() - (DAYS_IN_VIEW - 1))
    rangeStart.setHours(0, 0, 0, 0)

    const { data, error: fetchError } = await supabase
      .from('meals')
      .select('*')
      .eq('dog_id', selectedDog.id)
      .gte('eaten_at', rangeStart.toISOString())
      .order('eaten_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setMeals([])
    } else {
      setMeals(data ?? [])
    }

    setLoading(false)
  }, [selectedDog])

  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  const weekColumns = useMemo(() => buildWeekColumns(meals), [meals])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedDog || !foodName.trim() || !eatenAt) return

    setSubmitting(true)
    setError(null)

    const trimmedPortion = portionSize.trim()
    const { error: insertError } = await supabase.from('meals').insert({
      food_name: foodName.trim(),
      portion_size: trimmedPortion || null,
      eaten_at: new Date(eatenAt).toISOString(),
      dog_id: selectedDog.id,
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

  if (dogsReady && dogs.length === 0) {
    return (
      <div className="daily-log-page">
        <header className="daily-log-header">
          <h1 className="daily-log-title">Daily Log</h1>
          <p className="daily-log-subtitle">Last 7 days</p>
        </header>
        <div className="daily-log-empty-dogs">
          <p className="daily-log-empty-dogs-text">No dogs added yet</p>
          <Link to="/dogs" className="daily-log-add-dog-btn">
            Add a Dog
          </Link>
        </div>
      </div>
    )
  }

  if (!dogsReady || !selectedDog) {
    return (
      <div className="daily-log-page">
        <header className="daily-log-header">
          <h1 className="daily-log-title">Daily Log</h1>
          <p className="daily-log-subtitle">Last 7 days</p>
        </header>
        <p className="daily-log-select-prompt">Loading...</p>
      </div>
    )
  }

  return (
    <div className="daily-log-page">
      <header className="daily-log-header">
        <h1 className="daily-log-title">Daily Log</h1>
        <p className="daily-log-subtitle">
          Last 7 days · {selectedDog.name}
        </p>
      </header>

      <section className="meal-form-bar">
        <form className="meal-form meal-form--inline" onSubmit={handleSubmit}>
          <label className="form-field form-field--food">
            <span className="visually-hidden">Food name</span>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Food name"
              aria-label="Food name"
              required
            />
          </label>
          <label className="form-field form-field--portion">
            <span className="visually-hidden">Portion size</span>
            <input
              type="text"
              value={portionSize}
              onChange={(e) => setPortionSize(e.target.value)}
              placeholder="e.g. 1 cup (optional)"
              aria-label="Portion size (optional)"
            />
          </label>
          <label className="form-field form-field--time">
            <span className="visually-hidden">When eaten</span>
            <input
              type="datetime-local"
              value={eatenAt}
              onChange={(e) => setEatenAt(e.target.value)}
              aria-label="When eaten"
              required
            />
          </label>
          <button type="submit" className="meal-submit-btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Meal'}
          </button>
        </form>
      </section>

      {error && <p className="daily-log-error">{error}</p>}

      <section className="daily-log-week">
        {loading ? (
          <p className="daily-log-status">Loading meals...</p>
        ) : (
          <div className="days-scroll">
            <div className="days-columns">
              {weekColumns.map((dayColumn) => (
                <article
                  key={dayColumn.dateKey}
                  className={`day-column${dayColumn.hasMeals ? '' : ' day-column--empty'}`}
                >
                  <h2 className="day-column-title">{dayColumn.label}</h2>

                  <div className="day-column-body">
                    {dayColumn.periods.map(
                      (period) =>
                        period.meals.length > 0 && (
                          <div key={period.key} className="time-group">
                            <p className="time-group-label">{period.label}</p>
                            <ul className="meal-entries">
                              {period.meals.map((meal) => {
                                const eatenAtDate = new Date(meal.eaten_at)
                                const portion = meal.portion_size?.trim()
                                return (
                                  <li key={meal.id} className="meal-entry">
                                    <div className="meal-entry-body">
                                      <p className="meal-entry-name">{meal.food_name}</p>
                                      {portion && (
                                        <p className="meal-entry-portion">{portion}</p>
                                      )}
                                      <p className="meal-entry-time">
                                        {formatTime12Hour(eatenAtDate)}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      className="meal-delete-link"
                                      onClick={() => handleDelete(meal.id)}
                                      aria-label={`Delete ${meal.food_name}`}
                                    >
                                      Delete
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ),
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default DailyLog
