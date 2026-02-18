"""Launch script so `uvicorn main:app` works when run from backend/ (outer)."""
import importlib.util
import os
import sys

inner = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if inner not in sys.path:
    sys.path.insert(0, inner)

spec = importlib.util.spec_from_file_location("_app_main", os.path.join(inner, "main.py"))
_app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(_app)
app = _app.app
