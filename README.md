# 🚗 Next Lane Self Drives

A premium, full-stack self-drive car rental platform.

## 🏗️ Project Structure

```
next-lane-self-drives/
├── frontend/          # React.js + Tailwind + Framer Motion + Three.js
├── backend/           # Node.js + Express.js REST API
├── python-api/        # Python FastAPI for analytics & AI features
└── database/          # MongoDB schemas & seed data
```

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend (Node.js)
```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
# Runs on http://localhost:5000
```

### Python API
```bash
cd python-api
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### MongoDB
- Install MongoDB or use MongoDB Atlas (cloud)
- Update `MONGODB_URI` in backend `.env`

## 🔑 Environment Variables

### Backend `.env`
```
MONGODB_URI=mongodb://localhost:27017/nextlane
JWT_SECRET=your_super_secret_key_here
PORT=5000
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

### Python API `.env`
```
MONGODB_URI=mongodb://localhost:27017/nextlane
SECRET_KEY=your_python_secret
```

## 📱 Pages
- `/` — Home with 3D hero
- `/cars` — Car listing with filters
- `/cars/:id` — Car details with 3D view
- `/booking/:id` — Booking page
- `/contact` — Contact + map
- `/login` — Authentication
- `/register` — Register
- `/dashboard` — User dashboard
- `/admin` — Admin panel

## 🔗 Instagram
[@next_lane_self_drives](https://www.instagram.com/next_lane_self_drives)

## 💳 Payment
- Google Pay QR Code (upload via admin)
- Razorpay ready (plug in your key)

## 🛡️ Security
- JWT Authentication
- bcrypt password hashing
- Rate limiting
- CORS protection
- Input validation (Joi)
