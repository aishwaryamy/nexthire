from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import Base, engine
from routers.jobs import router as jobs_router
from routers.ai_tools import router as ai_router
from routers.discover import router as discover_router
from routers.interview import router as interview_router
from config import settings
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NextHire AI", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(ai_router)
app.include_router(discover_router)
app.include_router(interview_router)

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "3.0.0"}

static_dir = os.environ.get("STATIC_DIR", "")
if static_dir and os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        return FileResponse(os.path.join(static_dir, "index.html"))
