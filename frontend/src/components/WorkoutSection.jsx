import { useState } from 'react'

export default function WorkoutSection({ exercises, workouts, onAdd, onDelete }) {
  const [exerciseId, setExerciseId] = useState('')
  const [minutes, setMinutes] = useState('30')
  const [weight, setWeight] = useState('70')

  const submit = (e) => {
    e.preventDefault()
    if (!exerciseId || Number(minutes) <= 0 || Number(weight) <= 0) return
    onAdd({ exercise_id: Number(exerciseId), minutes: Number(minutes), weight_kg: Number(weight) })
  }

  const total = workouts.reduce((sum, w) => sum + w.calories, 0)

  return (
    <section>
      <h2>Workouts</h2>
      <form className="row" onSubmit={submit} aria-label="Add workout">
        <select aria-label="Exercise" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
          <option value="">Select exercise…</option>
          {exercises.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <input
          aria-label="Minutes"
          type="number"
          min="1"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <input
          aria-label="Weight (kg)"
          type="number"
          min="1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <button type="submit">Add workout</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Minutes</th>
            <th>Weight</th>
            <th>Burned</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {workouts.length === 0 && (
            <tr>
              <td colSpan="5" className="empty">
                No workouts for this day
              </td>
            </tr>
          )}
          {workouts.map((w) => (
            <tr key={w.id}>
              <td>{w.exercise_name}</td>
              <td>{w.minutes} min</td>
              <td>{w.weight_kg} kg</td>
              <td>{w.calories} kcal</td>
              <td>
                <button className="delete" onClick={() => onDelete(w.id)} aria-label={`Delete ${w.exercise_name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {workouts.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan="3">Total</td>
              <td>{Math.round(total * 10) / 10} kcal</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </section>
  )
}
