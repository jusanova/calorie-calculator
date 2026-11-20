const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') message = body.detail
    } catch {
      /* no JSON body */
    }
    throw new Error(message)
  }
  return res.status === 204 ? null : res.json()
}

const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) })
const del = (path) => request(path, { method: 'DELETE' })

export const api = {
  getFoods: () => request('/foods'),
  addFood: (data) => post('/foods', data),
  getExercises: () => request('/exercises'),
  getMeals: (day) => request(`/meals?day=${day}`),
  addMeal: (data) => post('/meals', data),
  deleteMeal: (id) => del(`/meals/${id}`),
  getWorkouts: (day) => request(`/workouts?day=${day}`),
  addWorkout: (data) => post('/workouts', data),
  deleteWorkout: (id) => del(`/workouts/${id}`),
  getSummary: (day) => request(`/summary?day=${day}`),
}
