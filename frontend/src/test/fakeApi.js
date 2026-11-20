import { vi } from 'vitest'

// A tiny in-memory imitation of the FastAPI backend, installed as global fetch.
export function installFakeApi() {
  const db = {
    foods: [
      { id: 1, name: 'Apple', calories_per_100g: 52 },
      { id: 2, name: 'Banana', calories_per_100g: 89 },
    ],
    exercises: [
      { id: 1, name: 'Running', met: 9.8 },
      { id: 2, name: 'Walking', met: 3.5 },
    ],
    meals: [],
    workouts: [],
    nextId: 100,
  }

  const json = (status, body) =>
    // structuredClone: like a real HTTP response, callers get a copy, not our arrays
    Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(structuredClone(body)) })

  const round = (n) => Math.round(n * 10) / 10

  const fetchMock = vi.fn((url, options = {}) => {
    const u = new URL(url, 'http://test')
    const path = u.pathname.replace(/^\/api/, '')
    const method = options.method ?? 'GET'
    const body = options.body ? JSON.parse(options.body) : null
    const day = u.searchParams.get('day')

    if (method === 'GET' && path === '/foods') return json(200, db.foods)
    if (method === 'GET' && path === '/exercises') return json(200, db.exercises)
    if (method === 'GET' && path === '/meals') return json(200, db.meals.filter((m) => m.day === day))
    if (method === 'GET' && path === '/workouts')
      return json(200, db.workouts.filter((w) => w.day === day))

    if (method === 'GET' && path === '/summary') {
      const eaten = db.meals.filter((m) => m.day === day).reduce((s, m) => s + m.calories, 0)
      const burned = db.workouts.filter((w) => w.day === day).reduce((s, w) => s + w.calories, 0)
      return json(200, { day, eaten: round(eaten), burned: round(burned), net: round(eaten - burned) })
    }

    if (method === 'POST' && path === '/foods') {
      if (db.foods.some((f) => f.name === body.name))
        return json(409, { detail: 'Food with this name already exists' })
      const food = { id: db.nextId++, ...body }
      db.foods.push(food)
      return json(201, food)
    }

    if (method === 'POST' && path === '/meals') {
      const food = db.foods.find((f) => f.id === body.food_id)
      const meal = {
        id: db.nextId++,
        ...body,
        food_name: food.name,
        calories: round((food.calories_per_100g * body.grams) / 100),
      }
      db.meals.push(meal)
      return json(201, meal)
    }

    if (method === 'POST' && path === '/workouts') {
      const ex = db.exercises.find((x) => x.id === body.exercise_id)
      const workout = {
        id: db.nextId++,
        ...body,
        exercise_name: ex.name,
        calories: round((ex.met * body.weight_kg * body.minutes) / 60),
      }
      db.workouts.push(workout)
      return json(201, workout)
    }

    const del = path.match(/^\/(meals|workouts)\/(\d+)$/)
    if (method === 'DELETE' && del) {
      db[del[1]] = db[del[1]].filter((x) => x.id !== Number(del[2]))
      return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(null) })
    }

    return json(404, { detail: 'Not found' })
  })

  vi.stubGlobal('fetch', fetchMock)
  return { db, fetchMock }
}
