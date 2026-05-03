from fastapi import FastAPI
app = FastAPI()

@app.post("/api/publish/{site_name}")
async def publish(site_name: str):
    # Your logic here
    return {"status": "success"}
