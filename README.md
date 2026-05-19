# Paw Check 🐾

Paw Check helps dog owners quickly understand whether the ingredients on a food label are safe, toxic, or uncertain for their pet—just by uploading or photographing the label.

**Live Demo:** [https://ingenious-stillness-production.up.railway.app](https://ingenious-stillness-production.up.railway.app)

## Tech Stack

- **Frontend:** React, Vite, deployed on Railway
- **Backend:** Python, Flask, deployed on Render
- **AI:** Claude API (claude-sonnet-4-6) for vision and ingredient analysis
- **CI/CD:** GitHub Actions with pytest

## Features

- Upload or take a photo of any food ingredient label
- Claude reads and analyzes every ingredient for dog safety
- Color-coded results: green (safe), red (toxic), yellow (uncertain)
- Overall verdict with explanation
- Scrollable ingredient breakdown

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/aastha111888/IngredientChecker.git
cd IngredientChecker
```

### 2. Set up the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Start the Flask server:

```bash
python3 app.py
```

The API runs at [http://localhost:8080](http://localhost:8080).

### 3. Set up the frontend

In a new terminal, from the project root:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory (or use the existing one):

```
VITE_API_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Open the URL shown in the terminal (typically [http://localhost:5173](http://localhost:5173)).

## CI/CD

GitHub Actions automatically runs `pytest` on the backend test suite for every push to `main` and for every pull request targeting `main`. The workflow installs dependencies from `backend/requirements.txt` and runs tests in `backend/tests/` with verbose output.

## How It Works

Paw Check uses Claude's multimodal vision capability to read ingredient labels directly from photos. When you upload an image, the backend sends it to Claude, which extracts each ingredient, classifies it as safe, toxic, or uncertain for dogs, and returns a structured JSON response that the frontend displays as an overall verdict and a detailed ingredient breakdown.
