"""Task status tracking endpoints.

Allows clients to check the status of Celery background tasks
(e.g., document uploads, fraud detection).
"""
from fastapi import APIRouter, Depends
from celery.result import AsyncResult

from config.celery_app import celery_app
from models.models import User
from routes.auth import get_current_user

router = APIRouter()


@router.get("/{task_id}")
def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Check the status of a background task.
    
    Returns task status and result (if completed).
    
    Possible statuses:
    - PENDING: Task is waiting to be picked up
    - STARTED: Task has started processing
    - SUCCESS: Task completed successfully
    - FAILURE: Task failed
    - RETRY: Task is being retried
    """
    result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": result.status,
    }
    
    if result.ready():
        if result.successful():
            response["result"] = result.result
        else:
            response["error"] = str(result.result)
    
    return response
