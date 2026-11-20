from app.calc import calories_burned, calories_eaten


def test_calories_eaten_per_portion():
    assert calories_eaten(52, 100) == 52
    assert calories_eaten(52, 150) == 78
    assert calories_eaten(165, 0) == 0


def test_calories_burned_uses_met_weight_and_time():
    # Running (MET 9.8), 70 kg, 30 min -> 9.8 * 70 * 0.5 = 343
    assert calories_burned(9.8, 70, 30) == 343
    # Walking (MET 3.5), 60 kg, 60 min -> 210
    assert calories_burned(3.5, 60, 60) == 210
