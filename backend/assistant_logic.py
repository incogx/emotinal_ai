"""
Simple rule-based assistant logic for the college demo.
"""

from __future__ import annotations

import json
import os
import random
import tempfile
from datetime import datetime
from pathlib import Path

# Use the repo folder locally, but switch to a writable temp directory on Vercel.
if os.getenv("VERCEL"):
    DATA_DIR = Path(tempfile.gettempdir()) / "nova_jarvis_data"
else:
    DATA_DIR = Path(__file__).resolve().parent / "data"

DATA_FILE = DATA_DIR / "user_data.json"


def ensure_data_file() -> None:
    """Create the data file if missing."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text(json.dumps({"name": ""}, indent=2), encoding="utf-8")


def read_user_data() -> dict:
    """Read saved user data from disk."""
    ensure_data_file()
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"name": ""}


def write_user_data(data: dict) -> None:
    """Write user data to disk."""
    ensure_data_file()
    DATA_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def save_name(name: str) -> str:
    """Save the user's name."""
    data = read_user_data()
    data["name"] = name.strip()
    write_user_data(data)
    return data["name"]


def get_saved_name() -> str:
    """Get the saved name if available."""
    data = read_user_data()
    return data.get("name", "").strip()


def get_current_time() -> str:
    """Return current time."""
    return datetime.now().strftime("%I:%M %p")


def get_current_date() -> str:
    """Return current date."""
    return datetime.now().strftime("%A, %d %B %Y")


def get_mock_emotion() -> str:
    """Return a fake emotion for the demo."""
    return random.choice(["Happy", "Neutral", "Sad"])


def extract_name_from_message(message: str) -> str:
    """Extract the name from a message like 'my name is Abdul'."""
    lowered = message.lower().strip()
    if lowered.startswith("my name is "):
        return message.strip()[11:].strip()
    return ""


def normalize_message(message: str) -> str:
    """Normalize common speech-recognition variations to supported commands."""
    lowered = message.lower().strip()

    replacements = {
        "hi": "hello",
        "hey jarvis": "hey",
        "hello jarvis": "hello",
        "how are you doing": "how are you",
        "what's your name": "what is your name",
        "who created you": "who made you",
        "what time is this": "what time is it",
        "what's the time": "what time is it",
        "tell joke": "tell me a joke",
        "tell us a joke": "tell me a joke",
        "open the google": "open google",
        "goodbye": "bye",
        "bye bye": "bye",
        "what's my name": "what is my name",
        "what is todays date": "what date is today",
        "what's today's date": "what date is today",
        "today's date": "what date is today",
    }

    return replacements.get(lowered, lowered)


def get_chat_response(message: str) -> dict:
    """Return a response using very simple if/elif/else logic."""
    text = message.strip()
    lowered = normalize_message(text)
    saved_name = get_saved_name()

    extracted_name = extract_name_from_message(text)
    if extracted_name:
        saved_name = save_name(extracted_name)
        return {
            "reply": f"Identity saved. Nice to meet you, {saved_name}.",
            "action": None,
        }

    if lowered == "hey":
        if saved_name:
            return {"reply": f"Welcome back {saved_name}", "action": None}
        return {"reply": "Hey. Systems online and ready.", "action": None}

    elif lowered == "hello":
        if saved_name:
            return {"reply": f"Welcome back {saved_name}", "action": None}
        return {"reply": "Hello. Systems online. Welcome Sir.", "action": None}

    elif lowered == "how are you":
        return {"reply": "All systems are stable. I am functioning at full efficiency.", "action": None}

    elif lowered == "what is your name":
        return {"reply": "I am Nova JARVIS, your futuristic college demo assistant.", "action": None}

    elif lowered == "who made you":
        return {"reply": "I was created as a college project demo using React and Flask.", "action": None}

    elif lowered == "what time is it":
        return {"reply": f"The current time is {get_current_time()}.", "action": None}

    elif lowered == "what date is today":
        return {"reply": f"Today is {get_current_date()}.", "action": None}

    elif lowered == "tell me a joke":
        return {"reply": "Why did the robot join college? Because it had great processing skills.", "action": None}

    elif lowered == "what can you do":
        return {
            "reply": "I can chat with you, remember your name, speak responses, listen to voice commands, show camera input, and display emotion status.",
            "action": None,
        }

    elif lowered == "where are you":
        return {
            "reply": "I am running locally on this computer as a Flask and React college project demo.",
            "action": None,
        }

    elif lowered == "are you real":
        return {
            "reply": "I am a simulated AI assistant with simple rule-based logic designed for a futuristic demo.",
            "action": None,
        }

    elif lowered == "what is ai":
        return {
            "reply": "AI stands for Artificial Intelligence, which means machines can perform tasks that usually need human intelligence.",
            "action": None,
        }

    elif lowered == "who is iron man":
        return {
            "reply": "Iron Man is Tony Stark, a Marvel superhero known for his advanced suit and JARVIS style AI systems.",
            "action": None,
        }

    elif lowered == "what is flask":
        return {
            "reply": "Flask is a lightweight Python web framework used to build the backend of this assistant.",
            "action": None,
        }

    elif lowered == "what is react":
        return {
            "reply": "React is a JavaScript library used to build interactive user interfaces like this futuristic dashboard.",
            "action": None,
        }

    elif lowered == "what is your purpose":
        return {
            "reply": "My purpose is to demonstrate a futuristic assistant interface for a college project using simple internal logic.",
            "action": None,
        }

    elif lowered == "can you remember me":
        return {
            "reply": "Yes. If you tell me your name using my name is Abdul, I can store it and greet you later.",
            "action": None,
        }

    elif lowered == "give me motivation":
        return {
            "reply": "You have already built the hardest part by starting. Stay calm, explain clearly, and your demo will go well.",
            "action": None,
        }

    elif lowered == "open google":
        return {"reply": "Opening Google now.", "action": "open_google"}

    elif lowered == "bye":
        return {"reply": "Goodbye. Powering down non-essential conversation modules.", "action": None}

    elif lowered == "what is my name":
        if saved_name:
            return {"reply": f"Your name is {saved_name}.", "action": None}
        return {"reply": "I do not have your name yet. Please say: my name is Abdul", "action": None}

    return {
        "reply": "API billing quota exceeded. Please upgrade premium access.",
        "action": None,
    }
