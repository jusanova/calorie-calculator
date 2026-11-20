import { useState } from 'react'

export default function MealSection({ foods, meals, onAdd, onDelete }) {
  const [foodId, setFoodId] = useState('')
  const [grams, setGrams] = useState('100')

  const submit = (e) => {
    e.preventDefault()
    if (!foodId || Number(grams) <= 0) return
    onAdd({ food_id: Number(foodId), grams: Number(grams) })
  }

  const total = meals.reduce((sum, m) => sum + m.calories, 0)

  return (
    <section>
      <h2>Food eaten</h2>
      <form className="row" onSubmit={submit} aria-label="Add meal">
        <select aria-label="Food" value={foodId} onChange={(e) => setFoodId(e.target.value)}>
          <option value="">Select food…</option>
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.calories_per_100g} kcal/100 g)
            </option>
          ))}
        </select>
        <input
          aria-label="Grams"
          type="number"
          min="1"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
        />
        <button type="submit">Add food</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Food</th>
            <th>Grams</th>
            <th>Calories</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {meals.length === 0 && (
            <tr>
              <td colSpan="4" className="empty">
                No food added for this day
              </td>
            </tr>
          )}
          {meals.map((m) => (
            <tr key={m.id}>
              <td>{m.food_name}</td>
              <td>{m.grams} g</td>
              <td>{m.calories} kcal</td>
              <td>
                <button className="delete" onClick={() => onDelete(m.id)} aria-label={`Delete ${m.food_name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {meals.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan="2">Total</td>
              <td>{Math.round(total * 10) / 10} kcal</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </section>
  )
}
