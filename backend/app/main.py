from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import engine, Base
from .seed_data import seed_database
from .routers import auth, questions, quiz, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial scenarios/profiles
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title="SecureMind - Staff Security Awareness Platform API",
    description="Backend API supporting scenario simulation, gamified cybersecurity quizzes, and HR/Admin security maturity telemetry.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Frontend (Vite, local, and production deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(quiz.router)
app.include_router(analytics.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "SecureMind API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
