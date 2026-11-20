import { useState } from 'react'

export default function FoodForm({ onAdd }) {
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || kcal === '' || Number(kcal) < 0) return
    const created = await onAdd({ name: name.trim(), calories_per_100g: Number(kcal) })
    if (created) {
      setName('')
      setKcal('')
    }
  }

  return (
    <details className="food-form">
      <summary>Food not in the list? Add your own</summary>
      <form className="row" onSubmit={submit} aria-label="Add custom food">
        <input aria-label="Food name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          aria-label="kcal per 100 g"
          placeholder="kcal / 100 g"
          type="number"
          min="0"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
        />
        <button type="submit">Save food</button>
      </form>
    </details>
  )
}
