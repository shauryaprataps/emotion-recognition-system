# Emotion Recognition System Backend

Run with:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Notes:

- `FER` is used for facial emotion inference.
- `SpeechBrain` wav2vec2 emotion recognition is used for voice inference.
- `j-hartmann/emotion-english-distilroberta-base` is used for text emotion inference.
- The first run downloads pretrained model weights automatically.
