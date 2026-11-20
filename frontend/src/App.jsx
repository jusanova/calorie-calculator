import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'
import Summary from './components/Summary.jsx'
import MealSection from './components/MealSection.jsx'
import WorkoutSection from './components/WorkoutSection.jsx'
import FoodForm from './components/FoodForm.jsx'

export function today() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export default function App() {
  const [day, setDay] = useState(today())
  const [foods, setFoods] = useState([])
  const [exercises, setExercises] = useState([])
  const [meals, setMeals] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  // Wraps an API call: shows the error message instead of crashing
  const run = useCallback(async (fn) => {
    try {
      setError('')
      return await fn()
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const loadDay = useCallback(
    () =>
      run(async () => {
        const [m, w, s] = await Promise.all([
          api.getMeals(day),
          api.getWorkouts(day),
          api.getSummary(day),
        ])
        setMeals(m)
        setWorkouts(w)
        setSummary(s)
      }),
    [day, run],
  )

  useEffect(() => {
    run(async () => {
      const [f, e] = await Promise.all([api.getFoods(), api.getExercises()])
      setFoods(f)
      setExercises(e)
    })
  }, [run])

  useEffect(() => {
    loadDay()
  }, [loadDay])

  const change = (fn) => run(async () => {
    await fn()
    await loadDay()
  })

  return (
    <div className="container">
      <header>
        <h1>Calorie Calculator</h1>
        <label className="day-picker">
          Day
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        </label>
      </header>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <Summary summary={summary} />

      <MealSection
        foods={foods}
        meals={meals}
        onAdd={(data) => change(() => api.addMeal({ ...data, day }))}
        onDelete={(id) => change(() => api.deleteMeal(id))}
      />

      <FoodForm
        onAdd={(data) =>
          run(async () => {
            const food = await api.addFood(data)
            setFoods((prev) => [...prev, food].sort((a, b) => a.name.localeCompare(b.name)))
            return food
          })
        }
      />

      <WorkoutSection
        exercises={exercises}
        workouts={workouts}
        onAdd={(data) => change(() => api.addWorkout({ ...data, day }))}
        onDelete={(id) => change(() => api.deleteWorkout(id))}
      />
    </div>
  )
}
