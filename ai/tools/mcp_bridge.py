import subprocess
import json
import os

def call_mcp_jira_ticket(summary, description, priority, assignee_group, user_email):
    """
    Envoie une requête JSON-RPC au serveur MCP Atlassian via STDIO.
    """
    # Chemin vers ton dossier mcp-nodejs-atlassian
    # On le calcule par rapport à l'emplacement de ce fichier (ai/tools/mcp_bridge.py)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mcp_dir = os.path.join(base_dir, "mcp-nodejs-atlassian")
    
    # Construction de la requête JSON-RPC demandée par ton serveur
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "jira_create_issue",
            "arguments": {
                "projectKey": "KAN", # Clé projet de ton image
                "issueType": "Task",
                "summary": summary,
                "description": f"RESPONSABLE : {assignee_group}\nPRIORITÉ : {priority}\nEMAIL : {user_email}\n\nDETAILS :\n{description}",
                "priority": priority.title() if priority else "Medium"
            }
        }
    }

    try:
        # On lance 'node dist/index.js' comme dans ton script Node
        process = subprocess.Popen(
            ["node", "dist/index.js"],
            cwd=mcp_dir,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # 📤 Envoyer vers MCP (stdin)
        stdout, stderr = process.communicate(input=json.dumps(request) + "\n")

        if process.returncode == 0:
            json_response = None
            for line in reversed(stdout.splitlines()):
                if line.strip().startswith("{") and line.strip().endswith("}"):
                    try:
                        json_response = json.loads(line)
                        break
                    except:
                        continue
            
            if json_response:
                # 1. Vérifier si c'est une erreur JSON-RPC
                if "error" in json_response:
                    error_msg = json_response["error"].get("message", "Erreur inconnue")
                    return f"Erreur Jira (MCP): {error_msg}"
                
                # 2. Extraire le résultat
                try:
                    content = json_response.get("result", {}).get("content", [])
                    if content and len(content) > 0:
                        text_data = content[0].get("text", "")
                        try:
                            jira_res = json.loads(text_data)
                            ticket_key = jira_res.get("key")
                            if ticket_key:
                                return f"ID du ticket: {ticket_key}, Priorité: {priority}, Email: {user_email}"
                        except:
                            import re
                            clean_text = re.sub(r'http\S+', '', text_data)
                            return f"Succès : {clean_text.strip()}"
                except Exception as e:
                    return f"Erreur lors du traitement de la réponse MCP : {str(e)}"
            
            return "Erreur : Le serveur MCP n'a pas renvoyé de réponse valide."
        else:
            return f"Erreur système MCP (Code {process.returncode}): {stderr}"

    except Exception as e:
        return f"Erreur de connexion: {str(e)}"