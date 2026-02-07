from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
#import all routes 
from server.routes.chat import router as chat_router
from server.routes.history import router as history_router
from server.routes.conversations import router as conversations_router
from server.routes.auth import router as auth_router
#import database setup 
from server.database import create_indexes

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup/shutdown events"""
    # Startup
    print("Starting chatbot backend...")
    await create_indexes()
    print("Backend initialized successfully")
    
    yield
    
    # Shutdown
    print("Shutting down chatbot backend...")

# Initialize FastAPI app
app = FastAPI(
    title="AI Chatbot Backend API",
    description="Production-ready backend for AI chatbot with conversation management",
    version="1.0.0",
    lifespan=lifespan
)    

# Allow interactions from the frontend cors configuration 
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Health check endpoint
@app.get("/health")
@app.get("/")
def health_check():
    """Service health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Chatbot API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
# Include all routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(history_router, prefix="/history", tags=["history"])
app.include_router(conversations_router, prefix="/conversations", tags=["conversations"])

