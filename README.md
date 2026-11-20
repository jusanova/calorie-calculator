# Calorie Calculator

A simple web app for tracking daily calories: log the food you ate and the workouts you did
(walking, running, cycling, …), and the app calculates calories eaten, calories burned and the net result.

- **Frontend:** React (Vite)
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL (Docker)

## How calories are calculated

- Food: `calories = kcal per 100 g × grams / 100`
- Exercise: `calories = MET × body weight (kg) × duration (hours)`
  (MET values come from the Compendium of Physical Activities, e.g. walking 3.5, running 9.8)

## Database tables

| Table       | Columns                                                  |
|-------------|----------------------------------------------------------|
| `foods`     | id, name, calories_per_100g                              |
| `meals`     | id, food_id → foods, grams, day                          |
| `exercises` | id, name, met                                            |
| `workouts`  | id, exercise_id → exercises, minutes, weight_kg, day     |

Tables are created automatically when the backend starts, and `foods` / `exercises` are filled with starter data.

## Running locally

1. Create `.env` in the project root:

   ```
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=calories
   ```

2. Start the database:

   ```
   docker compose up -d db
   ```

3. Start the backend (http://localhost:8000, API docs at http://localhost:8000/docs):

   ```
   cd backend
   python -m venv .venv
   .venv\Scripts\activate        # Linux/macOS: source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. Start the frontend (http://localhost:5173):

   ```
   cd frontend
   npm install
   npm run dev
   ```

The backend reads `DATABASE_URL` if it is set; otherwise it builds the URL from the `POSTGRES_*`
variables (plus optional `POSTGRES_HOST`, `POSTGRES_PORT`). The frontend calls `/api`, which Vite
forwards to the backend; set `VITE_API_URL` to point it somewhere else.

## Tests

```
cd backend && pytest          # API + calculation tests (in-memory SQLite, no Postgres needed)
cd frontend && npm test       # React component tests (backend is mocked)
```

## API

| Method | Path                     | Description                       |
|--------|--------------------------|-----------------------------------|
| GET    | `/api/health`            | Health check                      |
| GET    | `/api/foods`             | Food catalog                      |
| POST   | `/api/foods`             | Add a custom food                 |
| GET    | `/api/exercises`         | Exercise catalog                  |
| GET    | `/api/meals?day=`        | Meals for a day                   |
| POST   | `/api/meals`             | Add a meal                        |
| DELETE | `/api/meals/{id}`        | Delete a meal                     |
| GET    | `/api/workouts?day=`     | Workouts for a day                |
| POST   | `/api/workouts`          | Add a workout                     |
| DELETE | `/api/workouts/{id}`     | Delete a workout                  |
| GET    | `/api/summary?day=`      | Eaten / burned / net for a day    |
