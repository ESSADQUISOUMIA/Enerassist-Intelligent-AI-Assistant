import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_mistralai import MistralAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models
from qdrantdb import get_vector_config

load_dotenv()

def run_ingestion():
    # 1. Chargement des documents 
    files = ["./documents/Installation.pdf", "./documents/Depannage.pdf"]
    all_docs = []
    
    for file_path in files:
        if os.path.exists(file_path):
            print(f"📄 Chargement de {file_path}...")
            loader = PyPDFLoader(file_path)
            all_docs.extend(loader.load())
     
                    
    # 2. Découper le texte en (Chunks)
    text_splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", " ", ""],
        chunk_size=800, 
        chunk_overlap=100,
        length_function=len)
    
    raw_chunks = text_splitter.split_documents(all_docs)

    # --- ÉTAPE DE SÉCURITÉ : NETTOYAGE ---
    # On enlève les chunks vides ou qui ne sont pas du texte pur
    chunks = []
    for c in raw_chunks:
        # On force le contenu à être une string simple
        text_content = str(c.page_content).encode("utf-8", "ignore").decode("utf-8")
        if len(text_content.strip()) > 20:
            c.page_content = text_content
            chunks.append(c)
            
    #print(f"Nombre de chunks créés : {len(chunks)}")
    #print(f"Contenu du 2eme chunk : {chunks[1].page_content}")
    
    #3. Initialisation du client Qdrant Cloud
    config = get_vector_config()
    
    
    #4. Créer les Embeddings et envoyer vers Qdrant
    embeddings = MistralAIEmbeddings(api_key=os.getenv("MISTRAL_API_KEY"))
    
    print(f"Envoi de {len(chunks)} fragments vers Qdrant...")
    
    QdrantVectorStore.from_documents(
        chunks,
        embeddings,
        url = config["url"],
        api_key = config["api_key"],
        collection_name = config["collection_name"],
        batch_size=10,     # <--- On envoie par paquets de 10 chunks (plus léger)
        force_recreate=True,
        timeout=180       
    )
    print("Ingestion terminée !👌 Vos deux manuels sont prêts.")
    

    
if __name__ == "__main__":
    run_ingestion()
    
    