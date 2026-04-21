"""
Next Lane Self Drives — Python FastAPI
Handles: AI-driven analytics, dynamic pricing, location suggestions
"""
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from bson import ObjectId
import os
from dotenv import load_dotenv
from jose import jwt, JWTError

load_dotenv()

app = FastAPI(title="Next Lane Python API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/nextlane")
client = AsyncIOMotorClient(MONGO_URI)
db = client.nextlane

SECRET_KEY = os.getenv("JWT_SECRET", "change_me")

# ─── Security ─────────────────────────────────────────────────────────────────

security = HTTPBearer()

async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ─── Models ───────────────────────────────────────────────────────────────────

class PricingRequest(BaseModel):
    car_id: str
    start_date: date
    end_date: date
    base_price: float

class PricingResponse(BaseModel):
    total: float
    days: int
    weekday_days: int
    weekend_days: int
    weekday_rate: float
    weekend_rate: float
    breakdown: List[dict]

class SuggestionRequest(BaseModel):
    location: Optional[str] = "Tirupur"
    budget: Optional[float] = None
    car_type: Optional[str] = None
    days: Optional[int] = 1

# ─── Helpers ──────────────────────────────────────────────────────────────────

def is_weekend(d: date) -> bool:
    return d.weekday() >= 5  # 5=Sat, 6=Sun

def date_range(start: date, end: date):
    from datetime import timedelta
    current = start
    while current < end:
        yield current
        current += timedelta(days=1)

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "OK", "service": "next-lane-python-api", "timestamp": datetime.now().isoformat()}


@app.post("/pricing/calculate", response_model=PricingResponse)
async def calculate_dynamic_pricing(req: PricingRequest):
    """
    Calculate dynamic pricing with weekend surcharge.
    Weekend (Sat-Sun) = 1.3x base price.
    """
    if req.end_date <= req.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    days = list(date_range(req.start_date, req.end_date))
    if not days:
        raise HTTPException(status_code=400, detail="Invalid date range")

    # Fetch dynamic weekend multiplier from Settings collection
    setting = await db.settings.find_one({"key": "business"})
    weekend_multiplier = 1.3
    if setting and "value" in setting and "weekendMultiplier" in setting["value"]:
        weekend_multiplier = float(setting["value"]["weekendMultiplier"])

    breakdown = []
    total = 0.0
    weekday_count = 0
    weekend_count = 0

    for d in days:
        is_wknd = is_weekend(d)
        rate = req.base_price * weekend_multiplier if is_wknd else req.base_price
        total += rate
        breakdown.append({
            "date": d.isoformat(),
            "day": d.strftime("%A"),
            "rate": round(rate, 2),
            "is_weekend": is_wknd,
        })
        if is_wknd:
            weekend_count += 1
        else:
            weekday_count += 1

    return PricingResponse(
        total=round(total, 2),
        days=len(days),
        weekday_days=weekday_count,
        weekend_days=weekend_count,
        weekday_rate=req.base_price,
        weekend_rate=round(req.base_price * weekend_multiplier, 2),
        breakdown=breakdown,
    )


@app.get("/analytics/revenue", dependencies=[Depends(verify_admin)])
async def revenue_analytics(months: int = Query(6, ge=1, le=24)):
    """Monthly revenue breakdown for admin dashboard."""
    try:
        pipeline = [
            {"$match": {"status": {"$in": ["confirmed", "active", "completed"]}}},
            {"$group": {
                "_id": {
                    "year": {"$year": "$createdAt"},
                    "month": {"$month": "$createdAt"}
                },
                "revenue": {"$sum": "$totalAmount"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1}},
            {"$limit": months}
        ]
        result = await db.bookings.aggregate(pipeline).to_list(length=months)
        month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        formatted = [
            {
                "month": month_names[r["_id"]["month"] - 1],
                "year": r["_id"]["year"],
                "revenue": r["revenue"],
                "bookings": r["count"]
            }
            for r in result
        ]
        return {"data": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/popular-cars", dependencies=[Depends(verify_admin)])
async def popular_cars(limit: int = Query(5, ge=1, le=20)):
    """Most booked cars."""
    try:
        pipeline = [
            {"$group": {"_id": "$car", "bookings": {"$sum": 1}, "revenue": {"$sum": "$totalAmount"}}},
            {"$sort": {"bookings": -1}},
            {"$limit": limit},
            {"$lookup": {"from": "cars", "localField": "_id", "foreignField": "_id", "as": "carData"}},
            {"$unwind": "$carData"},
            {"$project": {
                "name": "$carData.name",
                "brand": "$carData.brand",
                "type": "$carData.type",
                "bookings": 1,
                "revenue": 1,
            }}
        ]
        result = await db.bookings.aggregate(pipeline).to_list(length=limit)
        # Convert ObjectId to string
        for r in result:
            r["_id"] = str(r["_id"])
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/booking-heatmap", dependencies=[Depends(verify_admin)])
async def booking_heatmap():
    """Returns booking counts by day of week for demand analysis."""
    try:
        pipeline = [
            {"$group": {
                "_id": {"$dayOfWeek": "$pickupDate"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        result = await db.bookings.aggregate(pipeline).to_list(length=7)
        day_names = {1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat"}
        formatted = [{"day": day_names.get(r["_id"], "?"), "count": r["count"]} for r in result]
        return {"data": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/suggestions")
async def get_car_suggestions(req: SuggestionRequest):
    """
    AI-style car recommendations based on budget, type, and duration.
    """
    try:
        query = {}
        query["available"] = True

        if req.car_type:            # Make search case-insensitive (e.g., matching "suv" to "SUV")
            query["type"] = {"$regex": f"^{req.car_type}$", "$options": "i"}

        if req.budget:
            # Filter cars within budget
            query["pricePerDay"] = {"$lte": req.budget}

        cars = await db.cars.find(query).sort("pricePerDay", 1).to_list(length=10)

        # Score cars
        suggestions = []
        for car in cars:
            score = 0
            # Prefer newer cars
            score += min((car.get("year", 2020) - 2019) * 10, 40)
            # Penalise expensive cars mildly
            if req.budget:
                ratio = car["pricePerDay"] / req.budget
                score += max(0, 30 - int(ratio * 30))
            # Bonus for features
            score += min(len(car.get("features", [])) * 3, 30)

            suggestions.append({
                "_id": str(car["_id"]),
                "name": car["name"],
                "brand": car["brand"],
                "type": car["type"],
                "pricePerDay": car["pricePerDay"],
                "fuel": car["fuel"],
                "transmission": car["transmission"],
                "score": score,
                "estimatedTotal": round(car["pricePerDay"] * (req.days or 1), 2),
                "reason": _get_reason(car, req),
            })

        suggestions.sort(key=lambda x: x["score"], reverse=True)
        return {"suggestions": suggestions[:5], "location": req.location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _get_reason(car: dict, req: SuggestionRequest) -> str:
    if car.get("type") == "SUV":
        return "Great for outstation trips and family rides"
    if car.get("fuel") == "Diesel":
        return "Ideal for long distances — great mileage"
    if car.get("transmission") == "Automatic":
        return "Effortless city driving with automatic gearbox"
    if car.get("pricePerDay", 9999) < 1500:
        return "Best value option for budget-conscious trips"
    return "Popular choice among our customers"


@app.get("/analytics/summary", dependencies=[Depends(verify_admin)])
async def analytics_summary():
    """Quick stats for admin overview."""
    try:
        total_cars = await db.cars.count_documents({})
        available_cars = await db.cars.count_documents({"available": True})
        total_bookings = await db.bookings.count_documents({})
        pending = await db.bookings.count_documents({"status": "pending"})
        revenue_agg = await db.bookings.aggregate([
            {"$match": {"status": {"$in": ["confirmed", "active", "completed"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}
        ]).to_list(1)
        return {
            "total_cars": total_cars,
            "available_cars": available_cars,
            "total_bookings": total_bookings,
            "pending_bookings": pending,
            "total_revenue": revenue_agg[0]["total"] if revenue_agg else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
