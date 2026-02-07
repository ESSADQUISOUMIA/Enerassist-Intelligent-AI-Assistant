"""
Conversation Service - Business logic for conversation management
"""
from typing import List, Optional, Dict
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
import uuid

from server.database import conversation_collection, history_collection
from server.models import (
    ConversationResponse,
    ConversationListItem,
    ConversationListResponse,
    MessageBase,
    MessageResponse,
    PaginationParams
)


class ConversationService:
    """Service for managing conversations"""
    
    async def create_conversation(
        self,
        historique_id: str,
        titre: str = "Nouvelle conversation",
        initial_messages: Optional[List[MessageBase]] = None
    ) -> str:
        """
        Create a new conversation
        
        Args:
            historique_id: The history ID this conversation belongs to
            titre: Conversation title
            initial_messages: Optional initial messages
            
        Returns:
            The created conversation ID
        """
        try:
            conversation_doc = {
                "historique_id": ObjectId(historique_id),
                "titre": titre,
                "messages": [msg.model_dump() for msg in (initial_messages or [])],
                "created_at": datetime.utcnow(),
                "last_updated": datetime.utcnow()
            }
            
            result = await conversation_collection.insert_one(conversation_doc)
            
            # Update history's updated_at timestamp
            await history_collection.update_one(
                {"_id": ObjectId(historique_id)},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            return str(result.inserted_id)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create conversation: {str(e)}"
            )
    
    async def get_conversation_by_id(
        self,
        conversation_id: str,
        historique_id: str
    ) -> ConversationResponse:
        """
        Get a specific conversation by ID
        Validates that the conversation belongs to the user's history
        
        Args:
            conversation_id: The conversation ID
            historique_id: The user's history ID (for ownership validation)
            
        Returns:
            Conversation details
            
        Raises:
            HTTPException: If not found or access denied
        """
        try:
            conversation = await conversation_collection.find_one({
                "_id": ObjectId(conversation_id),
                "historique_id": ObjectId(historique_id)
            })
            
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
            
            # Lazy Migration: Ensure all messages have IDs
            messages = conversation.get("messages", [])
            updated = False
            for msg in messages:
                if "id" not in msg:
                    msg["id"] = str(uuid.uuid4())
                    if "is_favorite" not in msg:
                        msg["is_favorite"] = False
                    updated = True
            
            if updated:
                await conversation_collection.update_one(
                    {"_id": ObjectId(conversation_id)},
                    {"$set": {"messages": messages}}
                )
            
            return self._format_conversation_response(conversation)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch conversation: {str(e)}"
            )
    
    async def list_conversations(
        self,
        historique_id: str,
        pagination: PaginationParams
    ) -> ConversationListResponse:
        """
        List all conversations for a history with pagination
        
        Args:
            historique_id: The user's history ID
            pagination: Pagination parameters
            
        Returns:
            Paginated list of conversations
        """
        try:
            query = {
                "historique_id": ObjectId(historique_id),
                "messages.0": {"$exists": True} # Only return conversations with at least 1 message
            }
            
            # Get total count
            total = await conversation_collection.count_documents(query)
            
            # Get paginated conversations, sorted by is_pinned (desc) then last_updated (desc)
            cursor = conversation_collection.find(query).sort(
                [("is_pinned", -1), ("last_updated", -1)]
            ).skip(pagination.skip).limit(pagination.limit)
            
            conversations = await cursor.to_list(length=pagination.limit)
            
            # Format response
            conversation_items = [
                self._format_conversation_list_item(conv)
                for conv in conversations
            ]
            
            return ConversationListResponse(
                conversations=conversation_items,
                total=total,
                skip=pagination.skip,
                limit=pagination.limit,
                has_more=pagination.skip + len(conversations) < total
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to list conversations: {str(e)}"
            )
    
    async def toggle_pin_status(
        self,
        conversation_id: str,
        historique_id: str,
        is_pinned: bool
    ) -> bool:
        """
        Update conversation pin status
        """
        try:
            result = await conversation_collection.update_one(
                {
                    "_id": ObjectId(conversation_id),
                    "historique_id": ObjectId(historique_id)
                },
                {"$set": {"is_pinned": is_pinned}}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
            return True
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update pin status: {str(e)}"
            )

    async def toggle_message_favorite(
        self,
        conversation_id: str,
        historique_id: str,
        message_id: str,
        is_favorite: bool
    ) -> bool:
        """
        Toggle favorite status for a specific message
        """
        try:
            # First check if conversation exists and belongs to user
            # Then update specific message in array using positional operator $
            query = {
                "_id": ObjectId(conversation_id),
                "historique_id": ObjectId(historique_id),
                "messages.id": message_id
            }
            
            update = {
                "$set": {"messages.$.is_favorite": is_favorite}
            }
            
            result = await conversation_collection.update_one(query, update)
            
            if result.matched_count == 0:
                # Could mean conversation not found OR message not found
                # Check conversation existence separately if needed, but 404 is appropriate
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Message not found or access denied"
                )
            
            return True
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update message favorite status: {str(e)}"
            )

    async def add_messages(
        self,
        conversation_id: str,
        historique_id: str,
        messages: List[MessageBase]
    ) -> bool:
        """
        Add messages to a conversation
        
        Args:
            conversation_id: The conversation ID
            historique_id: The user's history ID (for validation)
            messages: List of messages to add
            
        Returns:
            Success status
        """
        try:
            result = await conversation_collection.update_one(
                {
                    "_id": ObjectId(conversation_id),
                    "historique_id": ObjectId(historique_id)
                },
                {
                    "$push": {
                        "messages": {
                            "$each": [msg.model_dump() for msg in messages]
                        }
                    },
                    "$set": {"last_updated": datetime.utcnow()}
                }
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
            
            # Update history timestamp
            await history_collection.update_one(
                {"_id": ObjectId(historique_id)},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to add messages: {str(e)}"
            )
    
    async def delete_conversation(
        self,
        conversation_id: str,
        historique_id: str
    ) -> bool:
        """
        Delete a conversation (hard delete)
        
        Args:
            conversation_id: The conversation ID
            historique_id: The user's history ID (for validation)
            
        Returns:
            Success status
        """
        try:
            result = await conversation_collection.delete_one({
                "_id": ObjectId(conversation_id),
                "historique_id": ObjectId(historique_id)
            })
            
            if result.deleted_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
            
            # Update history timestamp
            await history_collection.update_one(
                {"_id": ObjectId(historique_id)},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete conversation: {str(e)}"
            )
    
    def _format_conversation_response(self, conversation: Dict) -> ConversationResponse:
        """Format MongoDB document to ConversationResponse"""
        messages = [
            MessageResponse(**msg) for msg in conversation.get("messages", [])
        ]
        
        return ConversationResponse(
            id=str(conversation["_id"]),
            titre=conversation["titre"],
            is_pinned=conversation.get("is_pinned", False),
            messages=messages,
            created_at=conversation["created_at"].isoformat(),
            last_updated=conversation["last_updated"].isoformat(),
            message_count=len(messages)
        )
    
    def _format_conversation_list_item(self, conversation: Dict) -> ConversationListItem:
        """Format MongoDB document to ConversationListItem"""
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
            is_pinned=conversation.get("is_pinned", False),
            last_updated=conversation["last_updated"].isoformat(),
            message_count=len(messages),
            preview=preview
        )


def get_conversation_service() -> ConversationService:
    """Dependency injection for ConversationService"""
    return ConversationService()
