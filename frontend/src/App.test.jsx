import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App, { today } from './App.jsx'
import { installFakeApi } from './test/fakeApi.js'

let fake

beforeEach(() => {
  fake = installFakeApi()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function renderApp() {
  render(<App />)
  // wait until catalogs are loaded
  await screen.findByRole('option', { name: /Apple/ })
}

describe('App', () => {
  test('shows empty state and zero summary', async () => {
    await renderApp()
    expect(screen.getByText('No food added for this day')).toBeInTheDocument()
    expect(screen.getByText('No workouts for this day')).toBeInTheDocument()
    expect(screen.getByTestId('eaten')).toHaveTextContent('0 kcal')
  })

  test('adding food shows it in the table and updates the summary', async () => {
    const user = userEvent.setup()
    await renderApp()

    await user.selectOptions(screen.getByLabelText('Food'), '1')
    await user.clear(screen.getByLabelText('Grams'))
    await user.type(screen.getByLabelText('Grams'), '200')
    await user.click(screen.getByRole('button', { name: 'Add food' }))

    expect(await screen.findByRole('cell', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByTestId('eaten')).toHaveTextContent('104 kcal')
    expect(fake.db.meals[0]).toMatchObject({ food_id: 1, grams: 200, day: today() })
  })

  test('adding a workout shows burned calories and net', async () => {
    const user = userEvent.setup()
    fake.db.meals.push({ id: 1, food_id: 2, food_name: 'Banana', grams: 100, day: today(), calories: 89 })
    await renderApp()

    await user.selectOptions(screen.getByLabelText('Exercise'), '1')
    await user.click(screen.getByRole('button', { name: 'Add workout' }))

    expect(await screen.findByRole('cell', { name: 'Running' })).toBeInTheDocument()
    expect(screen.getByTestId('burned')).toHaveTextContent('343 kcal')
    expect(screen.getByTestId('net')).toHaveTextContent('-254 kcal')
  })

  test('deleting a meal removes it', async () => {
    const user = userEvent.setup()
    fake.db.meals.push({ id: 7, food_id: 1, food_name: 'Apple', grams: 100, day: today(), calories: 52 })
    await renderApp()

    await user.click(await screen.findByRole('button', { name: 'Delete Apple' }))
    expect(await screen.findByText('No food added for this day')).toBeInTheDocument()
    expect(fake.db.meals).toHaveLength(0)
  })

  test('changing the day loads that day', async () => {
    fake.db.meals.push({ id: 8, food_id: 2, food_name: 'Banana', grams: 100, day: '2026-01-01', calories: 89 })
    await renderApp()
    expect(screen.queryByRole('cell', { name: 'Banana' })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '2026-01-01' } })

    expect(await screen.findByRole('cell', { name: 'Banana' })).toBeInTheDocument()
  })

  test('adding a custom food puts it in the food list', async () => {
    const user = userEvent.setup()
    await renderApp()

    const form = screen.getByRole('form', { name: 'Add custom food' })
    await user.type(within(form).getByLabelText('Food name'), 'Pizza')
    await user.type(within(form).getByLabelText('kcal per 100 g'), '266')
    await user.click(within(form).getByRole('button', { name: 'Save food' }))

    expect(await screen.findByRole('option', { name: /Pizza \(266 kcal/ })).toBeInTheDocument()
  })

  test('shows the backend error message', async () => {
    const user = userEvent.setup()
    await renderApp()

    const form = screen.getByRole('form', { name: 'Add custom food' })
    await user.type(within(form).getByLabelText('Food name'), 'Apple')
    await user.type(within(form).getByLabelText('kcal per 100 g'), '50')
    await user.click(within(form).getByRole('button', { name: 'Save food' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Food with this name already exists')
  })

  test('shows an error when the backend is down', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.reject() })))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed (500)')
  })
})
