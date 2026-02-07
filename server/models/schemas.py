"""
MongoDB Data Models and Pydantic Schemas
Handles all data structures for the chatbot application
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import uuid

# ==================== Message Models ====================

class MessageBase(BaseModel):
    """Base message structure"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = Field(..., pattern="^(user|assistant)$")
    texte: str = Field(..., min_length=1, max_length=10000)
    date: datetime = Field(default_factory=datetime.utcnow)
    is_favorite: bool = False

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "role": "user",
                "texte": "Bonjour",
                "date": "2024-01-29T11:00:00Z",
                "is_favorite": False
            }
        }
    }


class MessageResponse(MessageBase):
    """Message response model for API responses"""
    pass


# ==================== Conversation Models ====================

class ConversationBase(BaseModel):
    """Base conversation structure"""
    titre: str = Field(default="Nouvelle conversation", max_length=200)
    is_pinned: bool = False


class ConversationCreate(ConversationBase):
    """Schema for creating a new conversation"""
    pass


class ConversationResponse(BaseModel):
    """Conversation response for API"""
    id: str
    titre: str
    is_pinned: bool = False
    messages: List[MessageResponse]
    created_at: str
    last_updated: str
    message_count: int


class ConversationListItem(BaseModel):
    """Lightweight conversation item for listing"""
    id: str
    titre: str
    is_pinned: bool = False
    last_updated: str
    message_count: int
    preview: Optional[str] = None


class ConversationListResponse(BaseModel):
    """Paginated conversation list response"""
    conversations: List[ConversationListItem]
    total: int
    skip: int
    limit: int
    has_more: bool


# ==================== History Models ====================

class HistoryResponse(BaseModel):
    """History response with all conversations"""
    id: str
    user_id: str
    conversations: List[ConversationListItem]
    total_conversations: int
    created_at: str
    updated_at: str


# ==================== Chat Request/Response Models ====================

class ChatRequest(BaseModel):
    """Request model for sending a message"""
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_title: Optional[str] = Field(None, max_length=200)


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    conversation_id: str
    user_message: MessageResponse
    assistant_message: MessageResponse
    is_new_conversation: bool = False


# ==================== Pagination Models ====================

class PaginationParams(BaseModel):
    """Pagination parameters"""
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)



class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr

    class Config:
        # Pydantic v2 usage might differ slightly, but this is generally safe for v1/v2 compat or v1
        pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
