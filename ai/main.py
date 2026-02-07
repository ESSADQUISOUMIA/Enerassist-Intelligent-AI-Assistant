import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# Importe bot, l'outil ET le dictionnaire store pour gérer l'historique
from chatbot import get_chatbot_chain, create_atlassian_ticket, store 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

bot = get_chatbot_chain()

class ChatRequest(BaseModel):
    input: str
    session_id: str

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    config = {"configurable": {"session_id": request.session_id}}

    def generate():
        try:
            # On utilise .invoke pour capturer l'objet tool_calls proprement
            response = bot.invoke({"input": request.input}, config=config)
            
            # 1. Si l'IA envoie du texte normal
            if response.content:
                yield f"data: {response.content}\n\n"
            
            # 2. Si l'IA déclenche l'outil de Ticketing
            if hasattr(response, 'tool_calls') and response.tool_calls:
                for tool_call in response.tool_calls:
                    if tool_call["name"] == "create_atlassian_ticket":
                        yield f"data: ⚙️ Connexion au serveur MCP en cours...\n\n"
                        
                        # Exécution de l'outil
                        ticket_result = create_atlassian_ticket.invoke(tool_call["args"])
                        yield f"data: ✅ {ticket_result}\n\n"
                        
                        # IMPORTANT : Une fois le ticket créé, on nettoie l'historique 
                        # pour éviter l'erreur de désynchronisation Mistral (Code 3230)
                        if request.session_id in store:
                            store[request.session_id].clear()
                            yield f"data: [Système : Diagnostic terminé, historique réinitialisé]\n\n"

        except Exception as e:
            # Gestion spécifique de l'erreur de séquence Mistral
            if "3230" in str(e):
                if request.session_id in store:
                    store[request.session_id].clear()
                yield f"data: ⚠️ Désynchronisation détectée. L'historique a été réinitialisé. Veuillez reformuler votre demande.\n\n"
            else:
                yield f"data: ❌ Erreur technique : {str(e)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)