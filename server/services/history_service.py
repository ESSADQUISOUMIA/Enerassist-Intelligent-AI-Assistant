"""
History Service - Business logic for user history management
"""
from typing import Optional
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status

from server.database import history_collection, conversation_collection
from server.models import HistoryResponse, ConversationListItem


class HistoryService:
    """Service for managing user conversation histories"""
    
    async def get_or_create_history(self, user_id: str) -> str:
        """
        Get user's history or create if it doesn't exist
        Auto-creates history on first access
        
        Args:
            user_id: The user's ID
            
        Returns:
            The history ID
        """
        try:
            # Try to find existing history
            history = await history_collection.find_one({"user_id": ObjectId(user_id)})
            
            if history:
                return str(history["_id"])
            
            # Create new history if doesn't exist
            new_history = {
                "user_id": ObjectId(user_id),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await history_collection.insert_one(new_history)
            return str(result.inserted_id)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get or create history: {str(e)}"
            )
    
    async def get_full_history(self, user_id: str) -> HistoryResponse:
        """
        Get complete history with all conversations
        
        Args:
            user_id: The user's ID
            
        Returns:
            Complete history with all conversations
        """
        try:
            # Get or create history
            history = await history_collection.find_one({"user_id": ObjectId(user_id)})
            
            if not history:
                # Auto-create history
                historique_id = await self.get_or_create_history(user_id)
                return HistoryResponse(
                    id=historique_id,
                    user_id=user_id,
                    conversations=[],
                    total_conversations=0,
                    created_at=datetime.utcnow().isoformat(),
                    updated_at=datetime.utcnow().isoformat()
                )
            
            # Fetch all conversations for this history
            cursor = conversation_collection.find({
                "historique_id": history["_id"]
            }).sort("last_updated", -1)
            
            conversations = await cursor.to_list(length=None)
            
            # Format conversations
            conversation_items = [
                self._format_conversation_item(conv)
                for conv in conversations
            ]
            
            return HistoryResponse(
                id=str(history["_id"]),
                user_id=str(history["user_id"]),
                conversations=conversation_items,
                total_conversations=len(conversation_items),
                created_at=history["created_at"].isoformat(),
                updated_at=history["updated_at"].isoformat()
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch history: {str(e)}"
            )
    
    async def delete_all_conversations(self, user_id: str) -> bool:
        """
        Delete all conversations for a user (clear history)
        
        Args:
            user_id: The user's ID
            
        Returns:
            Success status
        """
        try:
            history = await history_collection.find_one({"user_id": ObjectId(user_id)})
            
            if not history:
                return True  # Nothing to delete
            
            # Delete all conversations
            await conversation_collection.delete_many({
                "historique_id": history["_id"]
            })
            
            # Update history timestamp
            await history_collection.update_one(
                {"_id": history["_id"]},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            return True
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to clear history: {str(e)}"
            )
    
    def _format_conversation_item(self, conversation: dict) -> ConversationListItem:
        """Format conversation for history response"""
        messages = conversation.get("messages", [])
        preview = None
        
        # Get first user message as preview
        for msg in messages:
            if msg.get("role") == "user":
                preview = msg.get("texte", "")[:100]
                if len(msg.get("texte", "")) > 100:
                    preview += "..."
                break
        
        return ConversationListItem(
            id=str(conversation["_id"]),
            titre=conversation["titre"],
            last_updated=conversation["last_updated"].isoformat(),
            message_count=len(messages),
            preview=preview
        )


def get_history_service() -> HistoryService:
    """Dependency injection for HistoryService"""
    return HistoryService()
