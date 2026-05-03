from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import shutil
import os

app = FastAPI()

class PublishData(BaseModel):
    html: str

@app.post("/upload/{site_name}")
async def upload(site_name: str, file: UploadFile = File(...)):
    path = f"storage/{site_name}"
    os.makedirs(path, exist_ok=True)
    with open(f"{path}/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"status": "uploaded"}

@app.post("/publish/{site_name}")
async def publish(site_name: str, data: PublishData):
    path = f"storage/{site_name}"
    os.makedirs(path, exist_ok=True)
    with open(f"{path}/index.html", "w") as f:
        f.write(data.html)
    # Here you would trigger the GitHub/Vercel CLI push
    return {"url": f"https://bog-g-host.vercel.app/{site_name}"}
