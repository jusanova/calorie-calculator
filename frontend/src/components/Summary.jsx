export default function Summary({ summary }) {
  const s = summary ?? { eaten: 0, burned: 0, net: 0 }
  return (
    <section className="summary" aria-label="Daily summary">
      <Card label="Eaten" value={s.eaten} testId="eaten" />
      <Card label="Burned" value={s.burned} testId="burned" />
      <Card label="Net" value={s.net} testId="net" />
    </section>
  )
}

function Card({ label, value, testId }) {
  return (
    <div className="card">
      <span className="card-label">{label}</span>
      <span className="card-value" data-testid={testId}>
        {value} kcal
      </span>
    </div>
  )
}
