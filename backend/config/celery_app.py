"""Celery application configuration.

Initializes Celery with Redis broker and result backend.
Auto-discovers tasks from the 'tasks' package.
"""
from celery import Celery
from config.settings import settings

# Create Celery app
celery_app = Celery(
    "insureme",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Celery configuration
celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    
    # Timezone
    timezone="Asia/Kolkata",
    enable_utc=True,
    
    # Task settings
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    
    # Result expiry (24 hours)
    result_expires=86400,
    
    # Connection settings — fail fast when Redis is unavailable
    broker_connection_timeout=2,
    broker_connection_retry_on_startup=False,
    result_backend_transport_options={"retry_policy": {"max_retries": 0}},
)

# Auto-discover tasks from the 'tasks' package
celery_app.autodiscover_tasks(["tasks"])
