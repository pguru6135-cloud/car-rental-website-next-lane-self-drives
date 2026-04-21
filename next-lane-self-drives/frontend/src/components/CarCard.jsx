import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUsers, FiZap } from 'react-icons/fi'
import { MdOutlineLocalGasStation } from 'react-icons/md'
import { formatCurrency } from '../utils/pricing'

const CAR_IMAGES = {
  'Swift Dzire': '/cars/dzire.png',
  'Dzire': '/cars/dzire.png',
  'Hyundai Creta': '/cars/creta.png',
  'Creta': '/cars/creta.png',
  'Hyundai i20': '/cars/i20.png',
  'i20': '/cars/i20.png',
  'Tata Nexon': '/cars/nexon.png',
  'Nexon': '/cars/nexon.png',
  'Maruti Baleno': '/cars/baleno.png',
  'Baleno': '/cars/baleno.png',
  'Honda City': '/cars/city.png',
  'City': '/cars/city.png',
  'Sedan': '/cars/dzire.png',
  'SUV': '/cars/creta.png',
  'Hatchback': '/cars/baleno.png',
  'MPV': '/cars/creta.png',
}

export function getCarImage(car) {
  if (CAR_IMAGES[car.name]) return CAR_IMAGES[car.name]
  const match = Object.keys(CAR_IMAGES).find(k =>
    car.name?.toLowerCase().includes(k.toLowerCase())
  )
  if (match) return CAR_IMAGES[match]
  if (car.image) return car.image
  return CAR_IMAGES[car.type] || CAR_IMAGES['Sedan']
}

export default function CarCard({ car, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/cars/${car._id}`} className="glass-card block overflow-hidden group">
        {/* Image area */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-dark-200 to-dark-300">
          <img
            src={getCarImage(car)}
            alt={car.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = CAR_IMAGES['Sedan'] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-400/80 via-transparent to-transparent" />

          <div className="absolute top-3 left-3">
            <span className="badge">{car.type}</span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${car.available ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-white/70 text-xs font-mono">{car.available ? 'Available' : 'Booked'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-heading font-bold text-white text-lg leading-tight">{car.name}</h3>
              <p className="text-white/40 text-sm font-body mt-0.5">{car.brand} · {car.year}</p>
            </div>
            <div className="text-right">
              <div className="price-tag text-2xl">{formatCurrency(car.pricePerDay)}</div>
              <div className="text-white/30 text-xs font-mono">/day</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-3 border-t border-white/5 mb-4">
            <SpecItem icon={<FiUsers size={13} />} label={`${car.seats} Seats`} />
            <SpecItem icon={<MdOutlineLocalGasStation size={13} />} label={car.fuel} />
            <SpecItem icon={<FiZap size={13} />} label={car.transmission} />
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-primary flex-1 py-2.5 text-sm text-center">
              Book Now
            </button>
            <button className="btn-ghost py-2.5 px-4 text-sm">
              Details
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SpecItem({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-white/50 text-xs font-body">
      <span className="text-brand-400">{icon}</span>
      {label}
    </div>
  )
}