import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed_data import seed_database
from app.models import Profile, Question, QuizResult

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login_profile():
    # 1. Register
    payload = {
        "name": "Jane Developer",
        "email": "jane.developer@company-test.io",
        "department": "Engineering",
        "role": "staff"
    }
    reg_res = client.post("/api/auth/register", json=payload)
    assert reg_res.status_code in [200, 201]
    data = reg_res.json()
    assert data["email"] == payload["email"].lower()
    assert data["role"] == "staff"

    # 2. Login
    login_res = client.post("/api/auth/login", json={"email": payload["email"]})
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["id"] == data["id"]
    assert login_data["name"] == "Jane Developer"

def test_admin_user_management_crud():
    # 1. List users
    users_res = client.get("/api/auth/users")
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 1
    
    # 2. Find a staff user and promote to Cyber Admin
    target_user = users[0]
    update_res = client.put(f"/api/auth/users/{target_user['id']}", json={
        "role": "admin",
        "department": "Cybersecurity & IT"
    })
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["role"] == "admin"
    assert updated_data["department"] == "Cybersecurity & IT"

    # 3. Fetch user history
    hist_res = client.get(f"/api/auth/users/{target_user['id']}/history")
    assert hist_res.status_code == 200
    assert isinstance(hist_res.json(), list)

def test_get_questions_by_type_and_category():
    # Fetch phishing emails
    phish_res = client.get("/api/questions?category=Phishing")
    assert phish_res.status_code == 200
    phish_questions = phish_res.json()
    assert len(phish_questions) > 0
    assert phish_questions[0]["category"] == "Phishing"

def test_submit_quiz_and_analytics():
    # 1. Register a test user
    user_res = client.post("/api/auth/register", json={
        "name": "Alex QA",
        "email": "alex.qa@company-test.io",
        "department": "Finance",
        "role": "staff"
    })
    user_id = user_res.json()["id"]

    # 2. Get questions
    q_res = client.get("/api/questions")
    questions = q_res.json()
    assert len(questions) >= 2

    # 3. Submit answers
    submission = {
        "user_id": user_id,
        "answers": [
            {"question_id": questions[0]["id"], "selected_index": questions[0]["correct_index"]},
            {"question_id": questions[1]["id"], "selected_index": questions[1]["correct_index"]}
        ]
    }
    res = client.post("/api/quiz/submit", json=submission)
    assert res.status_code == 201
    result_data = res.json()
    assert result_data["score"] == 2
    assert result_data["percentage"] == 100.0
    assert result_data["passed"] is True

    # 4. Verify Analytics Overview updates
    analytics_res = client.get("/api/analytics/overview")
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["security_maturity_index"] > 0
    assert len(analytics_data["department_benchmarks"]) > 0
