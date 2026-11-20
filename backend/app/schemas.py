from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class FoodIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    calories_per_100g: float = Field(ge=0, le=1000)


class FoodOut(FoodIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ExerciseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    met: float


class MealIn(BaseModel):
    food_id: int
    grams: float = Field(gt=0, le=5000)
    day: date


class MealOut(BaseModel):
    id: int
    food_id: int
    food_name: str
    grams: float
    day: date
    calories: float


class WorkoutIn(BaseModel):
    exercise_id: int
    minutes: float = Field(gt=0, le=1440)
    weight_kg: float = Field(gt=0, le=500)
    day: date


class WorkoutOut(BaseModel):
    id: int
    exercise_id: int
    exercise_name: str
    minutes: float
    weight_kg: float
    day: date
    calories: float


class Summary(BaseModel):
    day: date
    eaten: float
    burned: float
    net: float
