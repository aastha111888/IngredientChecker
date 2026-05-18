const VERDICT_STYLES = {
  safe: 'verdict-safe',
  unsafe: 'verdict-unsafe',
  uncertain: 'verdict-uncertain',
}

const STATUS_STYLES = {
  safe: 'badge-safe',
  toxic: 'badge-toxic',
  uncertain: 'badge-uncertain',
}

function Results({ result }) {
  if (!result) return null

  const overall = result.overall?.toLowerCase() ?? 'uncertain'
  const verdictClass = VERDICT_STYLES[overall] ?? VERDICT_STYLES.uncertain

  return (
    <section className="results">
      <div className={`verdict-banner ${verdictClass}`}>
        {result.overall}
      </div>

      {result.reason && <p className="verdict-reason">{result.reason}</p>}

      {result.ingredients?.length > 0 && (
        <ul className="ingredient-list">
          {result.ingredients.map((ingredient, index) => {
            const status = ingredient.status?.toLowerCase() ?? 'uncertain'
            const badgeClass = STATUS_STYLES[status] ?? STATUS_STYLES.uncertain

            return (
              <li key={`${ingredient.name}-${index}`} className="ingredient-row">
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
      )}
    </section>
  )
}

export default Results
