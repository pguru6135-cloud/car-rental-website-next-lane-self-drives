# 🚀 Deployment Guide — Next Lane Self Drives

## Free Hosting Options

### Frontend → Vercel (Free)
1. Push your project to GitHub
2. Go to https://vercel.com → Import project
3. Set root to `frontend/`
4. Add environment variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api` (Remember to add /api!)
5. Deploy!

### Backend (Node.js) → Render (Free)
1. Go to https://render.com → New Web Service
2. Connect GitHub repo, set root to `backend/`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables:
   - `MONGODB_URI`: Your Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
   - `JWT_SECRET`: A long random string
   - `FRONTEND_URL`: Your Vercel URL
   - `EMAIL_USER` / `EMAIL_PASS` (Optional)

> [!CAUTION]
> **Bad Auth Error?** If you see `authentication failed`, you must edit your `MONGODB_URI` on Render to match your Atlas username/password. Also, ensure you have whitelisted `0.0.0.0/0` in MongoDB Atlas Network Access.

### Python API → Render (Free)
1. New Web Service on Render
2. Root: `python-api/`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Database → MongoDB Atlas (Free Tier)
1. Go to https://cloud.mongodb.com
2. Create free cluster (M0 — 512MB free)
3. Create database user
4. Whitelist IPs (or allow all: 0.0.0.0/0 for dev)
5. Get connection string and set as `MONGODB_URI`

---

## Local Development

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB (local or Atlas)

### Step-by-step

```bash
# 1. Clone / unzip
cd next-lane-self-drives

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run seed    # Creates admin + sample cars
npm run dev     # Starts on :5000

# 3. Python API (optional)
cd ../python-api
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload  # Starts on :8000

# 4. Frontend
cd ../frontend
npm install
npm run dev     # Starts on :5173
```

Open http://localhost:5173

### Default Admin Login
- Email: `admin@nextlane.in`
- Password: `admin123`

---

## Post-Deploy Checklist
- [ ] Change admin password
- [ ] Set strong `JWT_SECRET`
- [ ] Upload GPay QR code in Admin → Settings
- [ ] Add your real phone number in settings
- [ ] Add cars via Admin → Cars
- [ ] Set up Gmail App Password for email notifications
- [ ] Test a full booking flow
- [ ] Connect custom domain (optional)
