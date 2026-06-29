from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import subprocess
import os
import uuid

app = FastAPI(title="AutoCaption AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Chargement du modèle Whisper...")
model = WhisperModel("small", device="cuda", compute_type="float16")
print("Modèle prêt ✅")


@app.get("/health")
def health():
    return {"status": "ok", "model": "whisper-small"}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = "fr"
):
    tmp_video = f"tmp_{uuid.uuid4().hex}.mp4"
    tmp_audio = f"tmp_{uuid.uuid4().hex}.wav"

    try:
        with open(tmp_video, "wb") as f:
            content = await file.read()
            f.write(content)

        result = subprocess.run([
            "ffmpeg", "-i", tmp_video,
            "-ar", "16000",
            "-ac", "1",
            "-y", tmp_audio
        ], capture_output=True)

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="Erreur FFmpeg")

        segments, info = model.transcribe(
            tmp_audio,
            language=language if language != "auto" else None,
            word_timestamps=True
        )

        captions = []
        for segment in segments:
            words = []
            if segment.words:
                words = [
                    {
                        "word": w.word.strip(),
                        "start": round(w.start, 2),
                        "end": round(w.end, 2)
                    }
                    for w in segment.words
                ]
            captions.append({
                "id": len(captions) + 1,
                "text": segment.text.strip(),
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "words": words
            })

        return {
            "language": info.language,
            "duration": round(info.duration, 2),
            "captions": captions
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(tmp_video):
            os.remove(tmp_video)
        if os.path.exists(tmp_audio):
            os.remove(tmp_audio)