"""POST /api/dub — accept video upload, start pipeline in background."""
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File

from app import store
from app.models.job import Job
from app.services.pipeline import run_pipeline, TMP_BASE

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp4", ".webm", ".mov", ".avi", ".mkv"}


@router.post("/api/dub")
async def start_dub(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    job_id = str(uuid.uuid4())

    # Save uploaded video to temp dir
    upload_dir = TMP_BASE / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    video_path = upload_dir / f"{job_id}{ext}"
    content = await file.read()
    video_path.write_bytes(content)

    # Register job and kick off background pipeline
    store.jobs[job_id] = Job(id=job_id)
    background_tasks.add_task(run_pipeline, job_id, str(video_path))

    return {"job_id": job_id}
