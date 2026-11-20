import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import MealSection from './MealSection.jsx'

const foods = [{ id: 1, name: 'Apple', calories_per_100g: 52 }]

test('does not submit without a selected food', async () => {
  const onAdd = vi.fn()
  render(<MealSection foods={foods} meals={[]} onAdd={onAdd} onDelete={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: 'Add food' }))
  expect(onAdd).not.toHaveBeenCalled()
})

test('shows total calories of all meals', () => {
  const meals = [
    { id: 1, food_name: 'Apple', grams: 100, calories: 52 },
    { id: 2, food_name: 'Apple', grams: 50, calories: 26 },
  ]
  render(<MealSection foods={foods} meals={meals} onAdd={() => {}} onDelete={() => {}} />)
  expect(screen.getByRole('cell', { name: '78 kcal' })).toBeInTheDocument()
})
