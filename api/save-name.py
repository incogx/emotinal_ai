"""Vercel function for saving the user's name."""

from flask import Flask, jsonify, request
from flask_cors import CORS

from backend.assistant_logic import save_name

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["POST"])
def save_name_route():
    """Save the user name."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"success": False, "message": "Name is required."}), 400

    saved_name = save_name(name)
    return jsonify({"success": True, "name": saved_name})
