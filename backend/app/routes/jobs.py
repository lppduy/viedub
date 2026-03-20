"""GET /api/jobs/{id} — poll job status and progress."""
from fastapi import APIRouter, HTTPException
from app import store

router = APIRouter()


@router.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    job = store.jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "step": job.step,
        "error": job.error,
    }
