from celery import Celery

# Your PostgreSQL database
DATABASE_URL = "postgresql://postgres:Satyn152%40gfg@localhost:5432/insurance_db"

celery_app = Celery(
    "claim_tasks",
    broker=f"sqla+{DATABASE_URL}",
    backend=f"db+{DATABASE_URL}",
    include=["tasks"]   # ✅ THIS FIXES YOUR ERROR
)

celery_app.conf.task_track_started = True
