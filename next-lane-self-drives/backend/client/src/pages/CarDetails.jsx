import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiUsers, FiZap, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { MdOutlineLocalGasStation } from 'react-icons/md'
import { carAPI } from '../utils/api'
import { getCarImage } from '../components/CarCard'
import { formatCurrency } from '../utils/pricing'
import { useAuthStore } from '../hooks/useStore'

export const CAR_3D_MODELS = {
  'Swift Dzire': 'https://sketchfab.com/models/95451c00cb2d48778f67d798167e7237/embed',
  'Hyundai Creta': 'https://sketchfab.com/models/67645b6f549441a786e2b4050dc0268b/embed',
  'Hyundai i20': 'https://sketchfab.com/models/7f1995ef586a4621b65afccbc450f949/embed',
  'Hyundai i20 N': 'https://sketchfab.com/models/7f1995ef586a4621b65afccbc450f949/embed',
  'Tata Nexon': 'https://sketchfab.com/models/e53cbdfb6cad4bc5a9ddee683a0578ee/embed',
  'Nexon': 'https://sketchfab.com/models/e53cbdfb6cad4bc5a9ddee683a0578ee/embed',
  'Maruti Baleno': 'https://sketchfab.com/models/438c1b0c1a4e4732aa1a3cbb505d19e5/embed',
  'Baleno': 'https://sketchfab.com/models/438c1b0c1a4e4732aa1a3cbb505d19e5/embed',
  'Honda City': 'https://sketchfab.com/models/75671276d4da476294202a5dc050a99e/embed',
  'City': 'https://sketchfab.com/models/75671276d4da476294202a5dc050a99e/embed',
  'default': 'https://sketchfab.com/models/95451c00cb2d48778f67d798167e7237/embed',
}

export const getModel3dUrl = (name) => {
  if (!name) return CAR_3D_MODELS['default']
  const n = name.toLowerCase()
  if (n.includes('swift') || n.includes('dzire')) return CAR_3D_MODELS['Swift Dzire']
  if (n.includes('creta')) return CAR_3D_MODELS['Hyundai Creta']
  if (n.includes('i20')) return CAR_3D_MODELS['Hyundai i20']
  if (n.includes('nexon')) return CAR_3D_MODELS['Tata Nexon']
  if (n.includes('baleno')) return CAR_3D_MODELS['Maruti Baleno']
  if (n.includes('city')) return CAR_3D_MODELS['Honda City']
  return CAR_3D_MODELS['default']
}

const DEMO_CARS = [
  { _id: '1', name: 'Swift Dzire', brand: 'Maruti', year: 2023, type: 'Sedan', pricePerDay: 1800, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: true, mileage: '23 kmpl', color: 'Pearl White', description: 'Reliable and fuel-efficient sedan.', features: ['Rear Camera', 'Bluetooth'], images: ['/cars/dzire.png'] },
  { _id: '2', name: 'Hyundai Creta', brand: 'Hyundai', year: 2023, type: 'SUV', pricePerDay: 2800, seats: 5, fuel: 'Diesel', transmission: 'Automatic', available: true, mileage: '17 kmpl', color: 'Phantom Black', description: 'Premium compact SUV.', features: ['Sunroof', 'Rear Camera', 'Apple CarPlay'], images: ['/cars/creta.png'] },
  { _id: '3', name: 'Hyundai i20', brand: 'Hyundai', year: 2022, type: 'Hatchback', pricePerDay: 1400, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: false, mileage: '20 kmpl', color: 'Fiery Red', description: 'Stylish hatchback.', features: ['Android Auto', 'Apple CarPlay'], images: ['/cars/i20.png'] },
  { _id: '4', name: 'Tata Nexon', brand: 'Tata', year: 2023, type: 'SUV', pricePerDay: 2500, seats: 5, fuel: 'Petrol', transmission: 'Automatic', available: true, mileage: '17 kmpl', color: 'Calgary White', description: '5-star safety rated SUV.', features: ['Sunroof', 'Rear Camera'], images: ['/cars/nexon.png'] },
  { _id: '5', name: 'Maruti Baleno', brand: 'Maruti', year: 2023, type: 'Hatchback', pricePerDay: 1300, seats: 5, fuel: 'Petrol', transmission: 'Automatic', available: true, mileage: '22 kmpl', color: 'Splendid Silver', description: 'Feature-packed hatchback.', features: ['HUD Display', 'Keyless Entry'], images: ['/cars/baleno.png'] },
  { _id: '6', name: 'Honda City', brand: 'Honda', year: 2022, type: 'Sedan', pricePerDay: 2000, seats: 5, fuel: 'Petrol', transmission: 'Automatic', available: true, mileage: '18 kmpl', color: 'Lunar Silver', description: 'Premium sedan.', features: ['Sunroof', 'Lane Assist'], images: ['/cars/city.png'] }
]

function Image360Viewer({ images }) {
  const [current, setCurrent] = useState(0)

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <motion.img
          key={current}
          src={images[current]}
          alt="Car view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover rounded-xl"
          style={{ filter: 'drop-shadow(0 0 30px rgba(249,115,22,0.3))' }}
        />
        <button
          onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-full flex items-center justify-center text-white hover:bg-brand-500/30 transition-all">
          <FiChevronLeft size={18} />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % images.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-full flex items-center justify-center text-white hover:bg-brand-500/30 transition-all">
          <FiChevronRight size={18} />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-full">
          <span className="text-brand-400 text-xs font-mono">📷 {current + 1} / {images.length}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-3 justify-center">
        {images.map((img, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${current === i ? 'border-brand-500' : 'border-white/10'}`}>
            <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CarDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('3d')

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true)
      try {
        const { data } = await carAPI.getOne(id)
        setCar(data.car)
      } catch {
        const demoInfo = DEMO_CARS.find(c => c._id === id) || DEMO_CARS[1]
        setCar({ ...demoInfo, _id: id })
      } finally {
        setLoading(false)
      }
    }
    fetchCar()
  }, [id])

  const handleBook = () => {
    if (!isAuthenticated()) {
      navigate(`/login?redirect=/booking/${id}`)
    } else {
      navigate(`/booking/${id}`)
    }
  }

  const matchedImage = car ? getCarImage(car) : '/cars/creta.png'
  const images = [matchedImage]
 
const model3dUrl = getModel3dUrl(car?.name)
  if (loading) return (
    <main className="min-h-screen pt-28 pb-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 font-mono">Loading car details...</p>
      </div>
    </main>
  )

  if (!car) return null

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/cars" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 font-body text-sm">
          <FiArrowLeft size={16} /> Back to cars
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - media */}
          <div>
            <div className="glass-card overflow-hidden mb-4" style={{ height: 380 }}>
              {view === '3d' ? (
                <iframe
                  title={`${car.name} 3D Model`}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  src={`${model3dUrl}?autostart=1&ui_theme=dark&ui_infos=0&ui_controls=1&ui_stop=0`}
                  className="w-full h-full"
                  style={{ borderRadius: '12px' }}
                />
              ) : (
                <Image360Viewer images={images} />
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setView('photos')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-heading border transition-all ${
                  view === 'photos'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                    : 'border-white/10 text-white/50'
                }`}>
                📷 Photos
              </button>
              <button onClick={() => setView('3d')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-heading border transition-all ${
                  view === '3d'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                    : 'border-white/10 text-white/50'
                }`}>
                🔄 3D Model
              </button>
            </div>
          </div>

          {/* Right - details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge">{car.type}</span>
              <span className={`badge ${car.available ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {car.available ? '● Available' : '● Booked'}
              </span>
            </div>

            <h1 className="font-heading font-bold text-white text-4xl mb-1">{car.name}</h1>
            <p className="text-white/40 font-body mb-6">{car.brand} · {car.year}</p>
            <p className="text-white/60 font-body leading-relaxed mb-8">{car.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { label: 'Seats', value: `${car.seats} Persons`, icon: <FiUsers /> },
                { label: 'Fuel', value: car.fuel, icon: <MdOutlineLocalGasStation /> },
                { label: 'Transmission', value: car.transmission, icon: <FiZap /> },
                { label: 'Mileage', value: car.mileage || 'N/A', icon: '⛽' },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-4">
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-white font-heading font-semibold">{s.value}</p>
                </div>
              ))}
            </div>

            {car.features?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-heading font-semibold text-white mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded-lg">
                      <FiCheck size={12} className="text-brand-400" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-white/40 text-sm font-body mb-1">Starting from</p>
                  <div className="price-tag text-4xl">{formatCurrency(car.pricePerDay)}</div>
                  <p className="text-white/30 text-sm font-mono">/day (weekday)</p>
                </div>
                <div className="text-right">
                  <p className="text-white/30 text-xs font-mono">Weekend rate</p>
                  <p className="text-brand-300 font-heading font-semibold">{formatCurrency(Math.round(car.pricePerDay * 1.3))}/day</p>
                </div>
              </div>

              <button onClick={handleBook} disabled={!car.available}
                className={`w-full py-4 rounded-xl font-heading font-semibold text-lg tracking-wide transition-all ${
                  car.available ? 'btn-primary' : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}>
                {car.available ? '🚗 Book This Car' : 'Currently Unavailable'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}