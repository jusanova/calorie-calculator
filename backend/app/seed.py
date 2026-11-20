from sqlalchemy import Engine, select
from sqlalchemy.orm import Session

from .models import Exercise, Food

FOODS = [
    ("Apple", 52),
    ("Banana", 89),
    ("Boiled egg", 155),
    ("Chicken breast", 165),
    ("Rice (cooked)", 130),
    ("Oatmeal (cooked)", 71),
    ("Bread", 265),
    ("Milk", 42),
    ("Cheese", 402),
    ("Potato (boiled)", 87),
]

# MET values from the Compendium of Physical Activities (approximate)
EXERCISES = [
    ("Walking", 3.5),
    ("Running", 9.8),
    ("Cycling", 7.5),
    ("Swimming", 6.0),
    ("Strength training", 5.0),
]


def seed(engine: Engine) -> None:
    """Fill the catalog tables on first start."""
    with Session(engine) as db:
        if not db.scalar(select(Food).limit(1)):
            db.add_all(Food(name=n, calories_per_100g=c) for n, c in FOODS)
        if not db.scalar(select(Exercise).limit(1)):
            db.add_all(Exercise(name=n, met=m) for n, m in EXERCISES)
        db.commit()
