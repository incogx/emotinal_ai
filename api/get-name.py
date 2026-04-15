"""Vercel function for returning the saved user name."""

from flask import Flask, jsonify
from flask_cors import CORS

from backend.assistant_logic import get_saved_name

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def get_name_route():
    """Return the saved name."""
    return jsonify({"name": get_saved_name()})
