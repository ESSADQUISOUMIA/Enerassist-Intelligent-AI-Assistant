import os
from dotenv import load_dotenv
from langchain_mistralai import MistralAIEmbeddings
from langchain_qdrant import QdrantVectorStore

from pathlib import Path

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

def get_embeddings():
    return MistralAIEmbeddings(api_key=os.getenv("MISTRAL_API_KEY"))

def get_vector_config():
    """Retourne les paramètres de connexion pour Qdrant"""
    return {
        "url": os.getenv("QDRANT_URL"),
        "api_key": os.getenv("QDRANT_API_KEY"),
        "collection_name": "installation-depannage"
    }
    