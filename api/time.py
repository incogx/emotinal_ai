"""Vercel function for time and date."""

from flask import Flask, jsonify
from flask_cors import CORS

from backend.assistant_logic import get_current_date, get_current_time

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def time_route():
    """Return time and date."""
    return jsonify({"time": get_current_time(), "date": get_current_date()})
