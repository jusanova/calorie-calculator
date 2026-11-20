def calories_eaten(calories_per_100g: float, grams: float) -> float:
    """Calories in a portion of food."""
    return round(calories_per_100g * grams / 100, 1)


def calories_burned(met: float, weight_kg: float, minutes: float) -> float:
    """Calories burned: MET x body weight (kg) x duration (hours)."""
    return round(met * weight_kg * minutes / 60, 1)
