import io
from unittest.mock import patch

import pytest

from app import app

MOCK_RESULT = {
    "overall": "safe",
    "reason": "All listed ingredients appear safe for dogs.",
    "ingredients": [
        {
            "name": "Chicken",
            "status": "safe",
            "note": "Lean protein is generally fine for dogs.",
        }
    ],
}

MINIMAL_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01"
    b"\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


def test_check_ingredients_returns_400_when_no_image(client):
    response = client.post("/check-ingredients")

    assert response.status_code == 400
    assert response.get_json() == {"message": "No image provided"}


def test_check_ingredients_returns_400_when_not_recognized_image_type(client):
    data = {"image": (io.BytesIO(b"not an image"), "notes.txt")}
    response = client.post("/check-ingredients", data=data)

    assert response.status_code == 400
    assert response.get_json() == {
        "message": "Unsupported or unrecognized image format"
    }


@patch("app.check_ingredients", return_value=MOCK_RESULT)
def test_check_ingredients_returns_200_with_json_structure(mock_check, client):
    data = {"image": (io.BytesIO(MINIMAL_PNG), "label.png")}
    response = client.post("/check-ingredients", data=data)

    assert response.status_code == 200
    body = response.get_json()
    assert body["overall"] == MOCK_RESULT["overall"]
    assert body["reason"] == MOCK_RESULT["reason"]
    assert isinstance(body["ingredients"], list)
    assert len(body["ingredients"]) == 1
    assert body["ingredients"][0]["name"] == "Chicken"
    assert body["ingredients"][0]["status"] == "safe"
    assert "note" in body["ingredients"][0]

    mock_check.assert_called_once()
    base64_arg, media_type_arg = mock_check.call_args[0]
    assert isinstance(base64_arg, str)
    assert media_type_arg == "image/png"
