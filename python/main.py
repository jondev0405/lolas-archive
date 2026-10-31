import os
import tempfile
import av

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


_orig_open = av.open

def _open_compat(*args, **kwargs):
    kwargs.pop("metadata_errors", None)  # newer PyAV rejects this kwarg
    return _orig_open(*args, **kwargs)

av.open = _open_compat

@app.get("/health")
def health():
    return {"ok": True, "model": MODEL_SIZE}


@app.post("/transcribe")
def transcribe(file: UploadFile = File(...), language: str | None = None):
    suffix = os.path.splitext(file.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file.file.read())
        path = tmp.name
    try:
        segments, info = model.transcribe(
            path, language=language, beam_size=5, vad_filter=True
        )
        # segments is a generator: the actual work happens while iterating
        text = " ".join(s.text.strip() for s in segments)
    finally:
        os.remove(path)
    return {"text": text, "language": info.language, "duration": info.duration}
