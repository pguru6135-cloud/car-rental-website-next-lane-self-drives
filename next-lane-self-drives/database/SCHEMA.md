# MongoDB Schema Reference — Next Lane Self Drives

## Collections

### users
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (unique, required)",
  "phone": "String",
  "password": "String (hashed, hidden from queries)",
  "role": "String (enum: user | admin, default: user)",
  "avatar": "String (URL)",
  "isActive": "Boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### cars
```json
{
  "_id": "ObjectId",
  "name": "String (required) — e.g. Swift Dzire",
  "brand": "String (required) — e.g. Maruti",
  "year": "Number (required)",
  "type": "String (enum: Sedan | SUV | Hatchback | MPV | Luxury)",
  "pricePerDay": "Number (required) — weekday base rate in INR",
  "seats": "Number (default: 5)",
  "fuel": "String (enum: Petrol | Diesel | Electric | CNG | Hybrid)",
  "transmission": "String (enum: Manual | Automatic | AMT)",
  "mileage": "String — e.g. 17 kmpl",
  "color": "String",
  "description": "String",
  "image": "String (primary image URL)",
  "images": "[String] (gallery URLs)",
  "features": "[String] — e.g. [Sunroof, Rear Camera]",
  "available": "Boolean (default: true)",
  "registrationNumber": "String (private)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### bookings
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "car": "ObjectId (ref: Car)",
  "name": "String (customer name at booking time)",
  "phone": "String",
  "pickupDate": "Date (required)",
  "returnDate": "Date (required)",
  "pickupLocation": "String",
  "notes": "String",
  "totalAmount": "Number (INR)",
  "status": "String (enum: pending | confirmed | active | completed | cancelled)",
  "payment": {
    "method": "String (default: gpay)",
    "status": "String (enum: pending | paid | refunded)",
    "transactionId": "String",
    "paidAt": "Date"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### settings (key-value store)
```json
{
  "_id": "ObjectId",
  "key": "String (unique) — e.g. qrImage | business",
  "value": "Mixed — e.g. /uploads/gpay-qr.png | { upiId, phone, weekendMultiplier }",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Indexes
- users: email (unique)
- cars: type + available + pricePerDay (compound)
- bookings: user + status (compound), car + pickupDate + returnDate (compound)
- settings: key (unique)
