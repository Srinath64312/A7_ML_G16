import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_expo_scenarios(client):
    rv = client.get('/api/expo/scenarios')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "success"
    assert len(data["scenarios"]) >= 4

def test_expo_simulate_persona(client):
    rv = client.post('/api/expo/simulate_persona', json={
        "persona_id": "developing",
        "policy": "DQN",
        "topic": "DSA",
        "steps": 4
    })
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "success"
    assert len(data["trace"]) == 4
    assert "net_gain" in data

def test_explain_decision(client):
    rv = client.post('/api/explain_decision', json={
        "mastery": 0.65,
        "difficulty": 3,
        "policy": "Q-Learning",
        "topic": "DSA"
    })
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "success"
    assert "q_values_by_difficulty" in data
    assert "zpd_alignment_index" in data

def test_ask_ai_coach(client):
    rv = client.post('/api/llm_tutor/ask_coach', json={
        "query": "Explain Binary Search Trees",
        "topic": "DSA",
        "mastery": 0.6
    })
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "success"
    assert "socratic_advice" in data

def test_expo_export_summary(client):
    rv = client.get('/api/expo/export_summary')
    assert rv.status_code == 200
    data = rv.get_json()
    assert "benchmarks" in data
    assert "algorithms" in data
