"""Serve output files (dubbed audio + subtitles) for a completed job."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app import store
from app.models.job import JobStatus

router = APIRouter()


def _get_done_job(job_id: str):
    job = store.jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobStatus.DONE:
        raise HTTPException(status_code=409, detail=f"Job is not done yet (status={job.status})")
    return job


@router.get("/api/output/{job_id}/audio")
def get_audio(job_id: str):
    job = _get_done_job(job_id)
    return FileResponse(
        job.result.dubbed_audio_path,
        media_type="audio/wav",
        filename="dubbed.wav",
    )


@router.get("/api/output/{job_id}/subtitles")
def get_subtitles(job_id: str):
    job = _get_done_job(job_id)
    return FileResponse(
        job.result.subtitles_path,
        media_type="text/vtt",
        filename="subtitles.vtt",
    )
