"""
History Routes - User conversation history API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status

from server.middlewares.auth import get_current_user
from server.models import HistoryResponse
from server.services import get_history_service, HistoryService

router = APIRouter()


@router.get("/all", response_model=HistoryResponse)
async def get_full_history(
    current_user: dict = Depends(get_current_user),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Get complete conversation history for the authenticated user
    Includes all conversations with metadata
    
    Auto-creates history if it doesn't exist yet
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Fetch complete history
        history = await history_service.get_full_history(user_id)
        
        return history
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )


@router.get("/stats", status_code=status.HTTP_200_OK)
async def get_history_statistics(
    current_user: dict = Depends(get_current_user),
    history_service: HistoryService = Depends(get_history_service)
):
    """
    Get statistics about user's conversation history
    
    Returns:
    - Total conversations
    - Total messages
    - Recent activity
    
    Authentication: Required (JWT)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Fetch history
        history = await history_service.get_full_history(user_id)
        
        # Calculate statistics
        total_conversations = history.total_conversations
        total_messages = sum(
            conv.message_count for conv in history.conversations
        )
        
        # Get most recent conversation
        most_recent = None
        if history.conversations:
            most_recent = {
                "id": history.conversations[0].id,
                "titre": history.conversations[0].titre,
                "last_updated": history.conversations[0].last_updated
            }
        
        return {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "most_recent_conversation": most_recent,
            "history_created_at": history.created_at,
            "last_activity": history.updated_at
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )
