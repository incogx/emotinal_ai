# Nova JARVIS Assistant

A futuristic Iron Man style assistant for a college project demo.

It looks advanced on the outside, but the internal logic is intentionally simple and beginner friendly.

## Tech Stack

- Frontend: React + modern CSS
- Backend: Python Flask
- Communication: REST API
- Speech: Browser speech recognition + speech synthesis
- Camera: Webcam in the browser
- Emotion: Mock/random emotion from Flask
- Data storage: Local JSON file + localStorage

## Project Structure

```text
simplegpt/
|-- backend/
|   |-- app.py
|   |-- assistant_logic.py
|   |-- requirements.txt
|   `-- data/
|       `-- user_data.json
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   |-- index.html
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       `-- styles.css
`-- README.md
```

## Features

- Dark JARVIS-inspired futuristic UI
- Animated glowing panels and AI orb
- Chat window with typing effect
- Voice input using browser speech recognition
- Voice output using speech synthesis
- Wake word mode using `Jarvis` after one-time microphone enable
- Webcam live preview
- Emotion status panel
- Rule-based chat logic with `if/elif/else`
- Name memory using a simple JSON file
- Unknown question fallback:
  `API billing quota exceeded. Please upgrade premium access.`

## Supported Chat Questions

- `hey`
- `hello`
- `how are you`
- `what is your name`
- `who made you`
- `what time is it`
- `what date is today`
- `tell me a joke`
- `what can you do`
- `where are you`
- `are you real`
- `what is ai`
- `who is iron man`
- `what is flask`
- `what is react`
- `what is your purpose`
- `can you remember me`
- `give me motivation`
- `open google`
- `bye`
- `my name is Abdul`
- `what is my name`

## Backend API Routes

- `POST /chat`
- `POST /save-name`
- `GET /get-name`
- `GET /emotion`
- `GET /time`

## Installation

## Vercel Deployment

This project is set up so the React frontend deploys from `frontend/` and the Flask API is exposed from `api/` on Vercel.

### 1. Push the repo to GitHub

If the project is not in git yet, initialize it locally, create a GitHub repository, and push the current branch there.

### 2. Import the GitHub repo into Vercel

In Vercel, choose the GitHub repository and use these settings:

- Build command: `npm install --prefix frontend && npm run build`
- Output directory: `frontend/dist`
- Framework preset: Other

### 3. Deploy

Vercel will serve the frontend and the API together. The frontend automatically uses `/api` in production and `http://127.0.0.1:5000` in local development.

### 4. Optional local override

If you want to point the frontend at a custom API base URL, set `VITE_API_BASE_URL` before running Vite.

## 1. Run the Flask backend

Open a terminal inside the `backend` folder:

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Mac/Linux

```bash
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

## 2. Run the React frontend

Open a second terminal inside the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

You can also run it from the project root after installing frontend packages:

```bash
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## 3. One-command demo start from the root folder

On Windows PowerShell, you can start both backend and frontend with one command:

```bash
npm run demo
```

What it does:

1. Creates the backend virtual environment if it does not exist
2. Installs backend requirements
3. Installs frontend packages if needed
4. Starts Flask in a new PowerShell window
5. Starts the React frontend in the current window

## How It Works

1. The user types or speaks a message in the React frontend.
2. React sends the message to Flask using `POST /chat`.
3. Flask checks the message using simple `if/elif/else` logic.
4. Flask sends back a reply and an optional action.
5. React shows the reply in the chat window and reads it aloud.
6. If the message is `my name is Abdul`, the name is saved in `user_data.json`.
7. The emotion panel updates from `GET /emotion`.
8. The assistant keeps listening in the background after one-time microphone enable and reacts when it hears `Jarvis`.

## Demo Presentation Explanation

Use this short explanation in your viva or class demo:

1. "This project is a futuristic assistant inspired by JARVIS from Iron Man."
2. "The frontend is made with React and a glowing dark dashboard design."
3. "The backend is built with Flask and communicates through REST APIs."
4. "Voice input uses browser speech recognition with a wake word mode, and the response is spoken using speech synthesis."
5. "The webcam feed is shown live in the interface."
6. "The emotion panel is implemented using simple mock logic, which keeps the project easy."
7. "The chatbot remembers the user's name using a local JSON file instead of a database."
8. "The assistant listens for the word Jarvis before processing a voice command, after microphone permission is enabled once."
9. "Internally the assistant uses beginner-friendly `if/elif/else` logic."
10. "Unknown questions show a premium quota message to simulate an advanced AI system."

## Suggested Demo Flow

1. Start with `hello`
2. Say `my name is Abdul`
3. Ask `what is my name`
4. Ask `what time is it`
5. Ask `tell me a joke`
6. Ask `open google`
7. Ask an unknown question to trigger the fake quota message

## Notes

- Use Google Chrome for the best speech recognition support.
- Allow microphone permission.
- Allow camera permission.
- No paid APIs are required.
- No database is required.
