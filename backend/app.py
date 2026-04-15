"""
Flask backend for the futuristic assistant project.
"""

from __future__ import annotations

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from .assistant_logic import (
        ensure_data_file,
        get_chat_response,
        get_current_date,
        get_current_time,
        get_mock_emotion,
        get_saved_name,
        save_name,
    )
except ImportError:
    from assistant_logic import (
        ensure_data_file,
        get_chat_response,
        get_current_date,
        get_current_time,
        get_mock_emotion,
        get_saved_name,
        save_name,
    )

app = Flask(__name__)
CORS(app)
ensure_data_file()


@app.route("/", methods=["GET"])
def home():
    """Health check route."""
    return jsonify(
        {
            "message": "Nova JARVIS backend is running.",
            "startupMessage": "Systems online. Welcome Sir.",
        }
    )


@app.route("/chat", methods=["POST"])
def chat():
    """Chat route."""
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"reply": "Please say something.", "action": None}), 400

    return jsonify(get_chat_response(message))


@app.route("/save-name", methods=["POST"])
def save_name_route():
    """Save the user name."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"success": False, "message": "Name is required."}), 400

    saved_name = save_name(name)
    return jsonify({"success": True, "name": saved_name})


@app.route("/get-name", methods=["GET"])
def get_name_route():
    """Return the saved name."""
    return jsonify({"name": get_saved_name()})


@app.route("/emotion", methods=["GET"])
def emotion_route():
    """Return a mock emotion."""
    return jsonify({"emotion": get_mock_emotion()})


@app.route("/time", methods=["GET"])
def time_route():
    """Return time and date."""
    return jsonify({"time": get_current_time(), "date": get_current_date()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
