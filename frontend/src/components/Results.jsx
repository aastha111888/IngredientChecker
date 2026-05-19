const VERDICT_STYLES = {
  safe: 'verdict-safe',
  unsafe: 'verdict-unsafe',
  uncertain: 'verdict-uncertain',
}

const VERDICT_LABELS = {
  safe: 'Safe',
  unsafe: 'Unsafe',
  uncertain: 'Uncertain',
}

const STATUS_STYLES = {
  safe: 'badge-safe',
  toxic: 'badge-toxic',
  uncertain: 'badge-uncertain',
}

const ROW_STYLES = {
  safe: 'row-safe',
  toxic: 'row-toxic',
  uncertain: 'row-uncertain',
}

function Results({ result }) {
  if (!result) return null

  const overall = result.overall?.toLowerCase() ?? 'uncertain'
  const verdictClass = VERDICT_STYLES[overall] ?? VERDICT_STYLES.uncertain
  const verdictLabel = VERDICT_LABELS[overall] ?? 'Uncertain'

  return (
    <section className="results">
      <div className="results-header">
        <div className={`verdict-banner ${verdictClass}`}>
          <p className="verdict-label">{verdictLabel}</p>
        </div>

        {result.reason && (
          <div className="verdict-reason-card">
            <p className="verdict-reason">{result.reason}</p>
          </div>
        )}
      </div>

      {result.ingredients?.length > 0 && (
        <div className="ingredient-list-scroll">
          <ul className="ingredient-list">
            {result.ingredients.map((ingredient, index) => {
              const status = ingredient.status?.toLowerCase() ?? 'uncertain'
              const badgeClass = STATUS_STYLES[status] ?? STATUS_STYLES.uncertain
              const rowClass = ROW_STYLES[status] ?? ROW_STYLES.uncertain

              return (
                <li
                  key={`${ingredient.name}-${index}`}
                  className={`ingredient-row ${rowClass}`}
                >
                  <div className="ingredient-header">
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className={`status-badge ${badgeClass}`}>
                      {ingredient.status}
                    </span>
                  </div>
                  {ingredient.note && (
                    <p className="ingredient-note">{ingredient.note}</p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

export default Results
