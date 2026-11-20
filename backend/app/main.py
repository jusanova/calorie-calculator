import os
from contextlib import asynccontextmanager
from datetime import date

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas
from .calc import calories_burned, calories_eaten
from .database import Base, engine, get_db, get_schema_engine
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    schema_engine = get_schema_engine()
    Base.metadata.create_all(bind=schema_engine)
    seed(schema_engine)
    if schema_engine is not engine:
        schema_engine.dispose()
    yield


app = FastAPI(title="Calorie Calculator API", lifespan=lifespan)

def allowed_origins() -> list[str]:
    """Comma-separated list in ALLOWED_ORIGINS, e.g. 'https://user.github.io'."""
    raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    return [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)


def meal_out(m: models.Meal) -> schemas.MealOut:
    return schemas.MealOut(
        id=m.id,
        food_id=m.food_id,
        food_name=m.food.name,
        grams=m.grams,
        day=m.day,
        calories=calories_eaten(m.food.calories_per_100g, m.grams),
    )


def workout_out(w: models.Workout) -> schemas.WorkoutOut:
    return schemas.WorkoutOut(
        id=w.id,
        exercise_id=w.exercise_id,
        exercise_name=w.exercise.name,
        minutes=w.minutes,
        weight_kg=w.weight_kg,
        day=w.day,
        calories=calories_burned(w.exercise.met, w.weight_kg, w.minutes),
    )


@app.get("/api/health")
def health():
    # Render sets RENDER_GIT_COMMIT; the deploy pipeline uses it to know
    # when the new version is live.
    return {"status": "ok", "commit": os.getenv("RENDER_GIT_COMMIT")}


# ---------- Foods ----------
@app.get("/api/foods", response_model=list[schemas.FoodOut])
def list_foods(db: Session = Depends(get_db)):
    return db.scalars(select(models.Food).order_by(models.Food.name)).all()


@app.post("/api/foods", response_model=schemas.FoodOut, status_code=201)
def create_food(data: schemas.FoodIn, db: Session = Depends(get_db)):
    name = data.name.strip()
    if db.scalar(select(models.Food).where(models.Food.name == name)):
        raise HTTPException(409, "Food with this name already exists")
    food = models.Food(name=name, calories_per_100g=data.calories_per_100g)
    db.add(food)
    db.commit()
    db.refresh(food)
    return food


# ---------- Exercises ----------
@app.get("/api/exercises", response_model=list[schemas.ExerciseOut])
def list_exercises(db: Session = Depends(get_db)):
    return db.scalars(select(models.Exercise).order_by(models.Exercise.name)).all()


# ---------- Meals ----------
@app.get("/api/meals", response_model=list[schemas.MealOut])
def list_meals(day: date, db: Session = Depends(get_db)):
    meals = db.scalars(
        select(models.Meal).where(models.Meal.day == day).order_by(models.Meal.id)
    ).all()
    return [meal_out(m) for m in meals]


@app.post("/api/meals", response_model=schemas.MealOut, status_code=201)
def create_meal(data: schemas.MealIn, db: Session = Depends(get_db)):
    if not db.get(models.Food, data.food_id):
        raise HTTPException(404, "Food not found")
    meal = models.Meal(**data.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal_out(meal)


@app.delete("/api/meals/{meal_id}", status_code=204)
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    meal = db.get(models.Meal, meal_id)
    if not meal:
        raise HTTPException(404, "Meal not found")
    db.delete(meal)
    db.commit()


# ---------- Workouts ----------
@app.get("/api/workouts", response_model=list[schemas.WorkoutOut])
def list_workouts(day: date, db: Session = Depends(get_db)):
    workouts = db.scalars(
        select(models.Workout).where(models.Workout.day == day).order_by(models.Workout.id)
    ).all()
    return [workout_out(w) for w in workouts]


@app.post("/api/workouts", response_model=schemas.WorkoutOut, status_code=201)
def create_workout(data: schemas.WorkoutIn, db: Session = Depends(get_db)):
    if not db.get(models.Exercise, data.exercise_id):
        raise HTTPException(404, "Exercise not found")
    workout = models.Workout(**data.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout_out(workout)


@app.delete("/api/workouts/{workout_id}", status_code=204)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.get(models.Workout, workout_id)
    if not workout:
        raise HTTPException(404, "Workout not found")
    db.delete(workout)
    db.commit()


# ---------- Summary ----------
@app.get("/api/summary", response_model=schemas.Summary)
def summary(day: date, db: Session = Depends(get_db)):
    eaten = sum(m.calories for m in list_meals(day, db))
    burned = sum(w.calories for w in list_workouts(day, db))
    return schemas.Summary(
        day=day, eaten=round(eaten, 1), burned=round(burned, 1), net=round(eaten - burned, 1)
    )
