# VeriAgent AI

An evidence-first information verification dashboard. The React application is organized under `src/`; the FastAPI service and SQLite repository live under `backend/app/`.

## Run locally

Install Node.js 20+ and Python 3.11+.

```powershell
npm install
npm run dev
```

In another terminal:

```powershell
py -m venv backend/.venv
backend/.venv/Scripts/Activate.ps1
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Open `http://localhost:5173`. The default iPhone answer is checked against fixed Apple Newsroom primary sources. The **Generate with Google** action uses Gemini's Google Search grounding and displays the citations returned with its answer. It requires a Gemini API key on the backend; without one, no generated answer is added.

Set the key in the same PowerShell session used to start FastAPI:

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

In `backend/.env`, set `GEMINI_API_KEY` to a key created in Google AI Studio. The local `.env` file is ignored by Git. Restart the backend after changing it, then Settings should show Google grounding as connected. Do not commit the key or put it in the React `.env` file.

The standalone Google Custom Search JSON API is closed to new customers; this integration uses Gemini's supported Google Search grounding instead.

## API

- `POST /api/verify` creates and stores a verification result.
- `POST /api/answer` generates a concise answer through Gemini Google Search grounding and returns its citations.
- `POST /api/claims` returns sentence candidates marked `UNASSESSED`; semantic extraction needs a configured model.
- `GET /api/verification/{id}` returns one stored report.
- `GET /api/history` returns stored reports, newest first.
- `GET /api/sources/{id}` returns evidence attached to a report.
- `GET /api/health` is a service health check.

Secrets belong in backend environment variables. `GEMINI_API_KEY` is read only by the backend and is never returned by the health endpoint or sent to the browser.