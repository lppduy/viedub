"""
Orchestrates the full dubbing pipeline for one job.
Runs as a FastAPI BackgroundTask.

Steps (with progress %):
  0%  → extract audio
  20% → transcribe
  50% → translate
  70% → TTS synthesis
  90% → merge audio + generate subtitles
  100% → done
"""
import os
import shutil
import traceback
from pathlib import Path

from app import store
from app.models.job import Job, JobStatus, JobResult
from app.services.audio_extractor import extract_audio
from app.services.transcribe import transcribe
from app.services.translate import translate
from app.services.tts import synthesize_segments
from app.services.audio_merger import merge_clips
from app.services.subtitle_generator import generate_vtt

TMP_BASE = Path("/tmp/viedub")


def _update(job: Job, progress: int, step: str) -> None:
    job.progress = progress
    job.step = step


def run_pipeline(job_id: str, video_path: str) -> None:
    """Full pipeline. Called as a background task."""
    job = store.jobs[job_id]
    job.status = JobStatus.PROCESSING
    work_dir = TMP_BASE / job_id
    work_dir.mkdir(parents=True, exist_ok=True)

    try:
        _update(job, 5, "extracting audio")
        audio_path = extract_audio(video_path, str(work_dir))

        _update(job, 20, "transcribing")
        segments = transcribe(audio_path)
        job.segments = segments

        _update(job, 50, "translating")
        segments = translate(segments)

        _update(job, 70, "synthesizing speech")
        clip_paths = synthesize_segments(segments, str(work_dir))

        _update(job, 90, "merging audio & subtitles")
        dubbed_path = merge_clips(clip_paths, segments, str(work_dir))
        subs_path = generate_vtt(segments, str(work_dir))

        job.result = JobResult(
            dubbed_audio_path=dubbed_path,
            subtitles_path=subs_path,
        )
        _update(job, 100, "done")
        job.status = JobStatus.DONE

    except Exception as exc:
        job.status = JobStatus.ERROR
        job.error = str(exc)
        job.step = "error"
        traceback.print_exc()

    finally:
        # Remove uploaded video — keep outputs in work_dir until served
        try:
            os.remove(video_path)
        except OSError:
            pass
