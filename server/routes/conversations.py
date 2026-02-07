"""
Conversation Routes - Conversation management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional

from server.middlewares.auth import get_current_user
from server.models import (
    ConversationResponse,
    ConversationListResponse,
    ConversationCreate,
    PaginationParams
)
from server.services import (
    get_conversation_service,
    get_history_service,
    ConversationService,
    HistoryService
)

router = APIRouter()


@router.post("/new", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_new_conversation(
    conversation_data: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Create a new conversation
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get or create user's history
        historique_id = await history_service.get_or_create_history(user_id)
        
        # Create conversation
        conversation_id = await conversation_service.create_conversation(
            historique_id=historique_id,
            titre=conversation_data.titre,
            initial_messages=[]
        )
        
        return {
            "conversation_id": conversation_id,
            "message": "Conversation created successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )


@router.get("/list", response_model=ConversationListResponse)
async def list_user_conversations(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum items to return"),
    current_user: dict = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    List all conversations for the authenticated user
    Supports pagination
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user's history
        historique_id = await history_service.get_or_create_history(user_id)
        
        # Get paginated conversations
        pagination = PaginationParams(skip=skip, limit=limit)
        conversations = await conversation_service.list_conversations(
            historique_id=historique_id,
            pagination=pagination
        )
        
        return conversations
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list conversations: {str(e)}"
        )


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Get a specific conversation by ID
    Validates ownership automatically
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user's history
        historique_id = await history_service.get_or_create_history(user_id)
        
        # Fetch conversation (ownership validation happens inside)
        conversation = await conversation_service.get_conversation_by_id(
            conversation_id=conversation_id,
            historique_id=historique_id
        )
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch conversation: {str(e)}"
        )


@router.delete("/{conversation_id}", status_code=status.HTTP_200_OK)
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Delete a conversation
    Validates ownership automatically
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user's history
        historique_id = await history_service.get_or_create_history(user_id)
        
        # Delete conversation (ownership validation happens inside)
        await conversation_service.delete_conversation(
            conversation_id=conversation_id,
            historique_id=historique_id
        )
        
        return {
            "message": "Conversation deleted successfully",
            "conversation_id": conversation_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )


@router.delete("/all/clear", status_code=status.HTTP_200_OK)
async def clear_all_conversations(
    current_user: dict = Depends(get_current_user),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Delete all conversations for the authenticated user
    Clear entire conversation history
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Delete all conversations
        await history_service.delete_all_conversations(user_id)
        
        return {
            "message": "All conversations cleared successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear conversations: {str(e)}"
        )
@router.patch("/{conversation_id}/pin", status_code=status.HTTP_200_OK)
async def pin_conversation(
    conversation_id: str,
    is_pinned: bool,
    current_user: dict = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Toggle pin status for a conversation
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user's history
        historique_id = await history_service.get_or_create_history(user_id)
        
        # Toggle pin status
        await conversation_service.toggle_pin_status(
            conversation_id=conversation_id,
            historique_id=historique_id,
            is_pinned=is_pinned
        )
        
        return {
            "message": "Conversation pin status updated",
            "conversation_id": conversation_id,
            "is_pinned": is_pinned
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update pin status: {str(e)}"
        )


@router.patch("/{conversation_id}/messages/{message_id}/favorite", status_code=status.HTTP_200_OK)
async def toggle_message_favorite(
    conversation_id: str,
    message_id: str,
    is_favorite: bool,
    current_user: dict = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Toggle favorite status for a specific message
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user's history
        historique_id = await history_service.get_or_create_history(user_id)
        
        # Toggle favorite status
        await conversation_service.toggle_message_favorite(
            conversation_id=conversation_id,
            historique_id=historique_id,
            message_id=message_id,
            is_favorite=is_favorite
        )
        
        return {
            "message": "Message favorite status updated",
            "conversation_id": conversation_id,
            "message_id": message_id,
            "is_favorite": is_favorite
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update message favorite status: {str(e)}"
        )
