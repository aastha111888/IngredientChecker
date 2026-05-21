# Paw Check 🐾

Keep your pup safe and healthy — check food ingredients for toxins and track what your dog eats every day.

**Live Demo:** [https://paw-check-frontend.onrender.com](https://paw-check-frontend.onrender.com)

## Features

### Ingredient Checker

Upload or take a photo of any food label. Claude reads and analyzes every ingredient for dog safety, with color-coded results: green (safe), red (toxic), yellow (uncertain). Ingredients are sorted with toxic at the top and safe at the bottom.

### Daily Log

Track what your dog eats over the past 7 days, grouped by day in a column view. Add food name, portion size, and time for each meal. Portion size is optional.

### My Dogs

Manage multiple dogs with name, breed, and age. Switch between dogs using the dropdown in the nav bar. Auto-selects your dog if you only have one. Supports adding, editing, and deleting dogs.

### Authentication

Private accounts with email and password login powered by Supabase Auth. Each user's data is fully private with Row Level Security — no one else can see or edit your dogs or meal logs.

## Tech Stack

- **Frontend:** React, Vite, deployed on Render
- **Backend:** Python, Flask, deployed on Render
- **AI:** Claude API (claude-sonnet-4-6) for vision and ingredient analysis
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **CI/CD:** GitHub Actions with pytest

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/aastha111888/IngredientChecker.git
cd IngredientChecker
```

### 2. Backend

Create a `.env` file in the `backend` directory with your API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Create a virtual environment, install dependencies, and start the server:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip3 install -r requirements.txt
python3 app.py
```

The API runs at [http://localhost:8080](http://localhost:8080).

### 3. Frontend

Create a `.env.local` file in the `frontend` directory:

```
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Install dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal (typically [http://localhost:5173](http://localhost:5173)).

## CI/CD

GitHub Actions automatically runs `pytest` on every push to `main`.

## How It Works

Paw Check uses Claude's multimodal vision capability to read ingredient labels directly from photos. When you upload an image, the backend sends it to Claude, which extracts each ingredient, classifies it as safe, toxic, or uncertain for dogs, and returns a structured JSON response that the frontend displays as an overall verdict and a detailed ingredient breakdown.
