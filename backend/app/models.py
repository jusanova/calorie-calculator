from datetime import date

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Food(Base):
    """Food catalog: calories per 100 g."""

    __tablename__ = "foods"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    calories_per_100g: Mapped[float] = mapped_column(Float)


class Meal(Base):
    """A food the user ate on a given day."""

    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id", ondelete="CASCADE"))
    grams: Mapped[float] = mapped_column(Float)
    day: Mapped[date] = mapped_column(Date, index=True)

    food: Mapped[Food] = relationship()


class Exercise(Base):
    """Exercise catalog with MET value (metabolic equivalent of task)."""

    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    met: Mapped[float] = mapped_column(Float)


class Workout(Base):
    """An exercise the user did on a given day."""

    __tablename__ = "workouts"

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="CASCADE"))
    minutes: Mapped[float] = mapped_column(Float)
    weight_kg: Mapped[float] = mapped_column(Float)
    day: Mapped[date] = mapped_column(Date, index=True)

    exercise: Mapped[Exercise] = relationship()
