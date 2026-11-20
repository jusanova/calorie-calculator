DAY = "2026-11-14"


def food_id(client, name):
    return next(f["id"] for f in client.get("/api/foods").json() if f["name"] == name)


def exercise_id(client, name):
    return next(e["id"] for e in client.get("/api/exercises").json() if e["name"] == name)


def test_health(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_catalogs_are_seeded(client):
    foods = client.get("/api/foods").json()
    exercises = client.get("/api/exercises").json()
    assert any(f["name"] == "Apple" for f in foods)
    assert {"Walking", "Running"} <= {e["name"] for e in exercises}


def test_create_food_and_reject_duplicate(client):
    res = client.post("/api/foods", json={"name": "Pizza", "calories_per_100g": 266})
    assert res.status_code == 201
    assert res.json()["name"] == "Pizza"

    dup = client.post("/api/foods", json={"name": "Pizza", "calories_per_100g": 1})
    assert dup.status_code == 409


def test_create_food_validation(client):
    res = client.post("/api/foods", json={"name": "", "calories_per_100g": -5})
    assert res.status_code == 422


def test_add_meal_calculates_calories(client):
    res = client.post(
        "/api/meals", json={"food_id": food_id(client, "Apple"), "grams": 200, "day": DAY}
    )
    assert res.status_code == 201
    body = res.json()
    assert body["food_name"] == "Apple"
    assert body["calories"] == 104

    meals = client.get("/api/meals", params={"day": DAY}).json()
    assert len(meals) == 1


def test_meals_are_filtered_by_day(client):
    apple = food_id(client, "Apple")
    client.post("/api/meals", json={"food_id": apple, "grams": 100, "day": DAY})
    client.post("/api/meals", json={"food_id": apple, "grams": 100, "day": "2026-11-13"})
    assert len(client.get("/api/meals", params={"day": DAY}).json()) == 1


def test_meal_with_unknown_food_returns_404(client):
    res = client.post("/api/meals", json={"food_id": 9999, "grams": 100, "day": DAY})
    assert res.status_code == 404


def test_meal_grams_must_be_positive(client):
    res = client.post(
        "/api/meals", json={"food_id": food_id(client, "Apple"), "grams": 0, "day": DAY}
    )
    assert res.status_code == 422


def test_delete_meal(client):
    meal = client.post(
        "/api/meals", json={"food_id": food_id(client, "Apple"), "grams": 100, "day": DAY}
    ).json()
    assert client.delete(f"/api/meals/{meal['id']}").status_code == 204
    assert client.get("/api/meals", params={"day": DAY}).json() == []
    assert client.delete(f"/api/meals/{meal['id']}").status_code == 404


def test_add_and_delete_workout(client):
    res = client.post(
        "/api/workouts",
        json={
            "exercise_id": exercise_id(client, "Running"),
            "minutes": 30,
            "weight_kg": 70,
            "day": DAY,
        },
    )
    assert res.status_code == 201
    workout = res.json()
    assert workout["exercise_name"] == "Running"
    assert workout["calories"] == 343

    assert client.delete(f"/api/workouts/{workout['id']}").status_code == 204
    assert client.get("/api/workouts", params={"day": DAY}).json() == []


def test_workout_with_unknown_exercise_returns_404(client):
    res = client.post(
        "/api/workouts",
        json={"exercise_id": 9999, "minutes": 30, "weight_kg": 70, "day": DAY},
    )
    assert res.status_code == 404


def test_summary(client):
    client.post(
        "/api/meals", json={"food_id": food_id(client, "Banana"), "grams": 100, "day": DAY}
    )
    client.post(
        "/api/workouts",
        json={
            "exercise_id": exercise_id(client, "Walking"),
            "minutes": 60,
            "weight_kg": 60,
            "day": DAY,
        },
    )
    res = client.get("/api/summary", params={"day": DAY}).json()
    assert res == {"day": DAY, "eaten": 89, "burned": 210, "net": -121}


def test_summary_empty_day(client):
    res = client.get("/api/summary", params={"day": "2020-01-01"}).json()
    assert res["eaten"] == 0 and res["burned"] == 0 and res["net"] == 0
