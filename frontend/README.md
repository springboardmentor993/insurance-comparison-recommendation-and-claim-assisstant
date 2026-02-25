<<<<<<< HEAD
# Insurance Comparison, Recommendation & Claim Assistant

A comprehensive full-stack insurance platform built with React.js, FastAPI, and PostgreSQL. Features policy comparison, personalized recommendations, claims management with fraud detection, and admin analytics.

## 🚀 Features

- **Policy Catalog**: Browse and compare insurance policies with advanced filtering
- **Premium Calculator**: Calculate adjusted premiums based on user parameters
- **Personalized Recommendations**: AI-powered policy suggestions based on user profile
- **Claims Management**: Complete claims workflow with document uploads to S3
- **Email Notifications**: Automated claim status updates via Celery & SMTP
- **Admin CSV Export**: One-click data export for all filtered claims
- **JWT Authentication**: Secure login with access and refresh tokens

## 🛠️ Tech Stack

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** ORM
- **PostgreSQL** database
- **JWT** authentication
- **AWS S3** for document storage
- **Celery** for asynchronous tasks
- **Redis** as message broker

## 📋 Prerequisites

- **Node.js** (v18+)
- **Python** (3.9+)
- **PostgreSQL** (13+)
- **Redis** (for Celery)
- **AWS Account** (for S3)

## 🔧 Installation

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - Database URL
   - JWT secret key
   - AWS credentials
   - Redis URL
   - SMTP settings

5. **Create database**:
   ```bash
   createdb insurance_db
   ```

6. **Seed sample data**:
   ```bash
   python seed_data.py
   ```

7. **Run the server**:
   ```bash
   python main.py
   ```
   
   API will be available at `http://localhost:8000`
   API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

### Celery Worker (Optional for Claims Processing)

1. **In a new terminal**, activate backend virtual environment
2. **Run Celery worker**:
   ```bash
   cd backend
   celery -A app.tasks worker --loglevel=info
   ```

## 📦 Docker Setup (Alternative)

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🎯 Usage

### Default Credentials

After seeding:
- **Admin**: `admin@insurance.com` / `admin123`
- **User**: `john@example.com` / `password123`

### Key Workflows

1. **Browse Policies**: Filter by type, premium range, and compare multiple policies
2. **Get Recommendations**: System generates personalized suggestions based on your profile
3. **File Claims**: Upload documents, submit for review, track status
4. **Admin Panel**: Monitor fraud flags, review claims, view analytics

## 📊 Database Schema

- **Users**: User accounts with risk profiles
- **Providers**: Insurance companies
- **Policies**: Insurance policy catalog
- **UserPolicies**: User-owned policies
- **Claims**: Filed insurance claims
- **ClaimDocuments**: S3-stored claim documents
- **Recommendations**: Personalized policy suggestions
- **FraudFlags**: Automated fraud detection alerts
- **AdminLogs**: Audit trail

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get profile

### Policies
- `GET /api/v1/policies` - List policies
- `GET /api/v1/policies/{id}` - Get policy details
- `GET /api/v1/policies/compare/multiple` - Compare policies
- `GET /api/v1/policies/calculate-premium/{id}` - Calculate premium

### Recommendations
- `GET /api/v1/recommendations` - Get recommendations
- `POST /api/v1/recommendations/regenerate` - Regenerate

### Claims
- `POST /api/v1/claims` - Create claim
- `GET /api/v1/claims` - List claims
- `POST /api/v1/claims/{id}/upload` - Upload document
- `POST /api/v1/claims/{id}/submit` - Submit claim

### Admin
- `GET /api/v1/admin/claims/all` - All claims
- `PUT /api/v1/admin/claims/{id}/status` - Update claim status
- `GET /api/v1/admin/fraud-flags` - Fraud flags
- `GET /api/v1/admin/statistics/claims` - Claim statistics
- `GET /api/v1/admin/statistics/policies` - Policy statistics

## 🚨 Fraud Detection Rules

1. **Duplicate Documents**: Detects same documents across multiple claims
2. **Frequent Claims**: Flags users filing multiple claims in short periods
3. **Excessive Amounts**: Claims significantly higher than policy premiums
4. **Early Claims**: Incidents shortly after policy purchase

## 🎨 Frontend Design

- Modern gradient-based UI
- Responsive design for all devices
- Real-time updates
- Loading states and error handling
- Intuitive navigation

## 🧪 Testing

Run tests:
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📝 License

MIT License

## 👥 Support

For issues or questions, please open a GitHub issue.
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> f755c1a (add frontend)
