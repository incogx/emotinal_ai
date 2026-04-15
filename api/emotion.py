"""Vercel function for mock emotion data."""

from flask import Flask, jsonify
from flask_cors import CORS

from backend.assistant_logic import get_mock_emotion

app = Flask(__name__)
CORS(app)


@app.route("/api/emotion", methods=["GET"])
def emotion_route():
    """Return a mock emotion."""
    return jsonify({"emotion": get_mock_emotion()})
