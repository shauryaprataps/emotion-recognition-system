# Emotion Recognition System

Full-stack multimodal emotion recognition prototype with a React frontend and FastAPI backend.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts, Axios
- Backend: FastAPI, FER, SpeechBrain, Transformers, OpenCV, Librosa, SQLite

## Setup

Backend:

```powershell
cd "c:\Users\91969\Documents\Data Science\Projects\emo_new\backend"
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```powershell
cd "c:\Users\91969\Documents\Data Science\Projects\emo_new\frontend"
npm install
Copy-Item .env.example .env
npm run dev
```



The first backend run downloads model weights automatically.

## Common Emotion Space

`angry, disgust, fear, happy, sad, surprise, neutral`

## API

`POST /api/predict`
- multipart fields: `face`, `audio`, `text`

`GET /api/history`

`GET /api/history/{session_id}`

`GET /api/settings`

`POST /api/settings`

## Example Predict Response

```json
{
  "session_id": "5f90f2ca12ab",
  "timestamp": "2026-03-28T12:00:00.000000",
  "final_emotion": "happy",
  "final_confidence": 0.51,
  "effective_weights": {
    "face": 0.5,
    "text": 0.5
  }
}
```

## Customize First

- UI: `frontend/src/pages/Home.jsx`, `frontend/src/pages/Dashboard.jsx`, `frontend/src/index.css`
- Models: `backend/app/services/face_service.py`, `backend/app/services/voice_service.py`, `backend/app/services/text_service.py`
- Fusion: `backend/app/services/fusion_service.py`
- Report generation: `backend/app/services/report_service.py`

## Custom Model Location

- Add checkpoints under `backend/saved_models/`
- Update service loading logic in `backend/app/services/`

## Pretrained Vs Custom Logic

- Pretrained: FER, SpeechBrain wav2vec2, HuggingFace DistilRoBERTa
- Custom: preprocessing, label mapping, weighted fusion, ratings, report generation, persistence
