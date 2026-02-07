"""
AI Service Layer - Abstraction for AI model integration
Provides a clean interface to interact with the chatbot AI model
"""
import sys
import os
from typing import List, Dict, AsyncGenerator
from datetime import datetime

# Add the ai directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai"))

from ai.chatbot import get_chatbot_chain, create_atlassian_ticket
from server.models import MessageBase
from langchain_core.messages import HumanMessage, AIMessage


class AIService:
    """
    Service layer for AI model integration
    Handles all AI-related operations in a pluggable, testable manner
    """
    
    def __init__(self):
        """Initialize the AI service with the chatbot chain"""
        self._chain = None
    
    def _get_chain(self):
        """Lazy initialization of the chatbot chain"""
        if self._chain is None:
            self._chain = get_chatbot_chain()
        return self._chain
    
    async def stream_response(
        self,
        user_message: str,
        conversation_id: str,
        chat_history: List[MessageBase],
        user_email: str = "Non spécifié"
    ) -> AsyncGenerator[str, None]:
        """
        Stream AI response for a user message
        """
        try:
            chain = self._get_chain()
            
            # Convert DB history to LangChain messages
            lc_history = []
            for msg in chat_history:
                if msg.role == "user":
                    lc_history.append(HumanMessage(content=msg.texte))
                elif msg.role == "assistant":
                    lc_history.append(AIMessage(content=msg.texte))
            
            async for chunk in self._stream_response(
                chain=chain,
                user_message=user_message,
                chat_history=lc_history,
                user_email=user_email
            ):
                yield chunk
            
        except Exception as e:
            print(f"❌ AI Service Error: {str(e)}")
            raise AIServiceException(f"Failed to generate AI response: {str(e)}")

    async def generate_response(
        self,
        user_message: str,
        conversation_id: str,
        chat_history: List[MessageBase],
        user_email: str = "Non spécifié"
    ) -> str:
        """
        Generate AI response for a user message
        """
        try:
            response_chunks = []
            async for chunk in self.stream_response(user_message, conversation_id, chat_history, user_email):
                response_chunks.append(chunk)
            
            return "".join(response_chunks)
            
        except Exception as e:
            print(f"❌ AI Service Error: {str(e)}")
            raise AIServiceException(f"Failed to generate AI response: {str(e)}")
    
    async def _stream_response(
        self,
        chain,
        user_message: str,
        chat_history: List,
        user_email: str = "Non spécifié"
    ) -> AsyncGenerator[str, None]:
        """
        Stream AI response chunks while handling tool calls
        """
        try:
            # Use invoke to properly capture tool_calls
            response = chain.invoke({"input": user_message, "chat_history": chat_history})
            
            # 1. Yield text content if any
            if response.content:
                yield response.content
            
            # 2. Handle tool calls
            if hasattr(response, 'tool_calls') and response.tool_calls:
                for tool_call in response.tool_calls:
                    if tool_call["name"] == "create_atlassian_ticket":
                        yield "\n⚙️ Connexion au serveur MCP en cours...\n"
                        
                        # Inject user_email into arguments
                        args = tool_call["args"]
                        args["user_email"] = user_email
                        
                        # Execute the tool
                        ticket_result = create_atlassian_ticket.invoke(args)
                        yield f"\n✅ {ticket_result}\n"
            
            # Fallback for empty responses to avoid Pydantic validation error
            if not response.content and not (hasattr(response, 'tool_calls') and response.tool_calls):
                yield "Désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?"
                    
        except Exception as e:
            raise AIServiceException(f"Error generating AI response: {str(e)}")
    
    def generate_conversation_title(self, first_message: str) -> str:
        """
        Generate a meaningful title from the first message
        
        Args:
            first_message: The first user message in the conversation
            
        Returns:
            Generated conversation title (max 50 chars)
        """
        # Simple title generation: take first 50 chars or first sentence
        title = first_message.strip()
        
        # Find first sentence ending
        for delimiter in ['.', '?', '!', '\n']:
            if delimiter in title:
                title = title.split(delimiter)[0]
                break
        
        # Truncate to 50 characters
        if len(title) > 50:
            title = title[:47] + "..."
        
        return title if title else "Nouvelle conversation"


class AIServiceException(Exception):
    """Custom exception for AI service errors"""
    pass


# Singleton instance
_ai_service_instance = None


def get_ai_service() -> AIService:
    """
    Dependency injection function for AIService
    Returns a singleton instance
    """
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance
