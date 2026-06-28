from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from .worker import dummy_midi_processing
from celery.result import AsyncResult
from .search_agent import analyze_query

app = FastAPI(title="ArrangerAI Backend")

# Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/session/upload")
async def upload_midi(file: UploadFile = File(...)):
    # In a real app, save the file to disk/cloud. For now, pass filename to task.
    task = dummy_midi_processing.delay(file.filename)
    return {"task_id": task.id, "status": "Queued", "filename": file.filename}

@app.get("/api/v1/search")
async def search_knowledge_base(q: str = Query(..., description="The search query")):
    """
    Intelligently parse the search query against the knowledge base and return segmented results.
    """
    results = analyze_query(q)
    return {"results": results}

@app.get("/api/v1/session/status/{task_id}")
async def get_status(task_id: str):
    task_result = AsyncResult(task_id)
    result = {
        "task_id": task_id,
        "state": task_result.state,
    }
    
    if task_result.state == 'PENDING':
        result['status'] = 'Queued'
        result['progress'] = 0
    elif task_result.state == 'PROCESSING':
        result['status'] = task_result.info.get('status', 'Processing')
        result['progress'] = task_result.info.get('progress', 0)
    elif task_result.state == 'SUCCESS':
        result['status'] = task_result.info.get('status', 'Complete')
        result['progress'] = 100
        result['result'] = task_result.info.get('result', '')
    else:
        result['status'] = 'Error'
        
    return result

from fastapi.responses import FileResponse
from fastapi import HTTPException
import os

@app.get("/api/v1/session/download/{task_id}")
async def download_midi(task_id: str):
    task_result = AsyncResult(task_id)
    if task_result.state == 'SUCCESS':
        output_file = task_result.info.get('output_file')
        if output_file and os.path.exists(output_file):
            return FileResponse(path=output_file, filename=os.path.basename(output_file), media_type='audio/midi')
    raise HTTPException(status_code=404, detail="File not found or task not complete")
