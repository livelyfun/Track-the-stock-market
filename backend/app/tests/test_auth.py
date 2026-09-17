import pytest

def test_auth_flow(client):
    register_payload = {
        "email": "investor_auth@example.com",
        "password": "Password123!",
        "preferred_market": "US",
        "preferred_language": "en",
        "preferred_currency": "USD"
    }
    reg_response = client.post("/api/v1/auth/register", json=register_payload)
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "investor_auth@example.com"
    assert user_data["preferred_market"] == "US"
    assert user_data["has_completed_onboarding"] is False

    dup_response = client.post("/api/v1/auth/register", json=register_payload)
    assert dup_response.status_code == 400

    login_response = client.post("/api/v1/auth/login", json={
        "email": "investor_auth@example.com",
        "password": "Password123!"
    })
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "investor_auth@example.com"
