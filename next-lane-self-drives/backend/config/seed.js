require("dotenv").config({ path: require("path").join(__dirname, "../.env") })
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log("Connected to DB")

  const User = require("../models/User")
  const Car = require("../models/Car")

  const hash = await bcrypt.hash("admin123", 10)
  await User.findOneAndUpdate(
    { email: "pguru6135@gmail.com" },
    { name: "Admin", email: "pguru6135@gmail.com", password: hash, role: "admin", phone: "9342179459" },
    { upsert: true, new: true }
  )
  console.log("Admin created")

  const cars = [
    { name: "Swift Dzire", brand: "Maruti Suzuki", year: 2023, type: "Sedan", pricePerDay: 1800, seats: 5, fuel: "Petrol", transmission: "Manual", mileage: "23 kmpl", color: "Pearl White", available: true, image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80", images: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80"], description: "Reliable and fuel-efficient sedan.", features: ["Rear Camera", "Bluetooth", "USB Charging"] },
    { name: "Hyundai Creta", brand: "Hyundai", year: 2023, type: "SUV", pricePerDay: 2800, seats: 5, fuel: "Diesel", transmission: "Automatic", mileage: "17 kmpl", color: "Phantom Black", available: true, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80", images: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80"], description: "Premium compact SUV.", features: ["Sunroof", "Rear Camera", "Apple CarPlay"] },
    { name: "Hyundai i20", brand: "Hyundai", year: 2022, type: "Hatchback", pricePerDay: 1400, seats: 5, fuel: "Petrol", transmission: "Manual", mileage: "20 kmpl", color: "Fiery Red", available: true, image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80", images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"], description: "Stylish hatchback.", features: ["Android Auto", "Apple CarPlay"] },
    { name: "Tata Nexon", brand: "Tata", year: 2023, type: "SUV", pricePerDay: 2500, seats: 5, fuel: "Petrol", transmission: "Automatic", mileage: "17 kmpl", color: "Calgary White", available: true, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"], description: "5-star safety rated SUV.", features: ["Sunroof", "Rear Camera", "Cruise Control"] },
    { name: "Maruti Baleno", brand: "Maruti Suzuki", year: 2023, type: "Hatchback", pricePerDay: 1300, seats: 5, fuel: "Petrol", transmission: "Automatic", mileage: "22 kmpl", color: "Splendid Silver", available: true, image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80", images: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"], description: "Feature-packed hatchback.", features: ["HUD Display", "Apple CarPlay", "Keyless Entry"] },
    { name: "Honda City", brand: "Honda", year: 2022, type: "Sedan", pricePerDay: 2000, seats: 5, fuel: "Petrol", transmission: "Automatic", mileage: "18 kmpl", color: "Lunar Silver", available: true, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80", images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"], description: "Premium sedan.", features: ["Sunroof", "Lane Assist", "Rear Camera"] },
  ]

  await Car.deleteMany({})
  await Car.insertMany(cars)
  console.log("6 cars seeded!")

  await mongoose.disconnect()
  console.log("Done!")
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
