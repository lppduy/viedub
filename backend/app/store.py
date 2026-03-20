"""In-memory job store. Single-user local tool — no persistence needed."""
from app.models.job import Job

# Global dict: job_id -> Job
jobs: dict[str, Job] = {}
