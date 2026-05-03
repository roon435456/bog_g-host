import os
import base64
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Replace these with your actual info or environment variables
GITHUB_TOKEN = "your_github_token"
GITHUB_USER = "your_github_username"
REPO_NAME = "bog-g-host-sites" # The repo Vercel is watching

class PublishRequest(BaseModel):
    site_name: str
    html_content: str

@app.post("/publish")
async def publish_to_github(data: PublishRequest):
    # Vercel structure: site_name/index.html
    file_path = f"{data.site_name}/index.html"
    url = f"https://api.github.com/repos/{GITHUB_USER}/{REPO_NAME}/contents/{file_path}"
    
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    # 1. Check if file exists to get the 'sha' (required for updates)
    sha = None
    async with httpx.AsyncClient() as client:
        get_res = await client.get(url, headers=headers)
        if get_res.status_code == 200:
            sha = get_res.json()['sha']

        # 2. Push/Update the file
        payload = {
            "message": f"Deploy {data.site_name}",
            "content": base64.b64encode(data.html_content.encode()).decode(),
        }
        if sha:
            payload["sha"] = sha

        put_res = await client.put(url, headers=headers, json=payload)
        
        if put_res.status_code in [200, 201]:
            return {"url": f"https://bog-g-host.vercel.app/{data.site_name}"}
        
        raise HTTPException(status_code=400, detail="GitHub Push Failed")
