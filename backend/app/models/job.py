from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
from app.models.segment import Segment


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    ERROR = "error"


@dataclass
class JobResult:
    """Output paths after successful processing."""
    dubbed_audio_path: str   # absolute path to merged dubbed wav
    subtitles_path: str      # absolute path to WebVTT file


@dataclass
class Job:
    """Represents one dubbing job."""
    id: str
    status: JobStatus = JobStatus.PENDING
    progress: int = 0        # 0-100
    step: str = "queued"     # human-readable current step
    result: Optional[JobResult] = None
    error: Optional[str] = None
    segments: list[Segment] = field(default_factory=list)
