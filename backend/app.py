import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from checker import check_ingredients

load_dotenv(Path(__file__).resolve().parent / ".env")

app = Flask(__name__)
CORS(app)

_MIME_BY_KIND = {
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
}


def detect_image_media_type(data: bytes) -> str | None:
    try:
        import imghdr

        kind = imghdr.what(None, h=data)
        if kind in _MIME_BY_KIND:
            return _MIME_BY_KIND[kind]
    except ModuleNotFoundError:
        pass

    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp"
    return None


@app.route("/check-ingredients", methods=["POST"])
def check_ingredients_endpoint():
    print("endpoint hit")
    image_file = request.files.get("image")
    if not image_file or not image_file.filename:
        return jsonify({"message": "No image provided"}), 400

    image_bytes = image_file.read()
    media_type = detect_image_media_type(image_bytes)
    if not media_type:
        return jsonify({"message": "Unsupported or unrecognized image format"}), 400

    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    result = check_ingredients(base64_image, media_type)
    return jsonify(result)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=port == 8080)
