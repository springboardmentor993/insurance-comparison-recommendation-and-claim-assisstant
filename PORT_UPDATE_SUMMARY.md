# ✅ Port Configuration Fixed

## Issue
Frontend was trying to connect to `http://localhost:8000`, but the backend is running on `http://localhost:8001`.

**Error:** `Failed to load resource: net::ERR_CONNECTION_REFUSED`

## Files Updated

### 1. Main API Configuration
**File:** `frontend/insurance/src/services/api.js`
- ✅ Changed: `http://localhost:8000` → `http://localhost:8001`

### 2. Error Message
**File:** `frontend/insurance/src/pages/Register.jsx`
- ✅ Changed error message to reference port 8001

### 3. Legacy API File
**File:** `backend/api.js`
- ✅ Changed: `http://localhost:8000` → `http://localhost:8001`

## Current Setup

| Service | Port | Status |
|---------|------|--------|
| Frontend (Vite) | 5173 | ✅ Running |
| Backend (FastAPI) | 8001 | ✅ Running |

## Verification

Your frontend should now successfully connect to the backend. All API requests will go to:
```
http://localhost:8001
```

The Vite dev server will automatically reload with the changes.

## Next Time

To avoid this issue in the future, you can:

1. **Use environment variables** (recommended):
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
   ```

2. **Create `.env` file** in `frontend/insurance/`:
   ```env
   VITE_API_URL=http://localhost:8001
   ```

3. **Restart backend on port 8000**:
   ```powershell
   # Stop current server on 8001
   # Then:
   cd backend\backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

---

**Status:** ✅ Frontend is now configured to connect to backend on port 8001!
