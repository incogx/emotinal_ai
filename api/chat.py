"""Vercel function for chat responses."""

from flask import Flask, jsonify, request
from flask_cors import CORS

from backend.assistant_logic import get_chat_response

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["POST"])
def chat():
    """Chat route."""
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"reply": "Please say something.", "action": None}), 400

    return jsonify(get_chat_response(message))
