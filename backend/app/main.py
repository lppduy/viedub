from dotenv import load_dotenv
load_dotenv()  # load .env before anything else

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import dub, jobs, output

app = FastAPI(title="VieDub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dub.router)
app.include_router(jobs.router)
app.include_router(output.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
