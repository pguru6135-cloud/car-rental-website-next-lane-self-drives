import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import CarCard from '../components/CarCard'
import { carAPI } from '../utils/api'

const CAR_TYPES = ['All', 'Sedan', 'SUV', 'Hatchback', 'MPV']
const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'Electric']
const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'year_desc' },
]

// Demo data fallback
const DEMO_CARS = [
  { _id: '1', name: 'Swift Dzire', brand: 'Maruti', year: 2023, type: 'Sedan', pricePerDay: 1800, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: true },
  { _id: '2', name: 'Creta', brand: 'Hyundai', year: 2023, type: 'SUV', pricePerDay: 2800, seats: 5, fuel: 'Diesel', transmission: 'Automatic', available: true },
  { _id: '3', name: 'i20', brand: 'Hyundai', year: 2022, type: 'Hatchback', pricePerDay: 1400, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: false },
  { _id: '4', name: 'Nexon', brand: 'Tata', year: 2023, type: 'SUV', pricePerDay: 2500, seats: 5, fuel: 'Petrol', transmission: 'Automatic', available: true },
  { _id: '5', name: 'Baleno', brand: 'Maruti', year: 2023, type: 'Hatchback', pricePerDay: 1300, seats: 5, fuel: 'Petrol', transmission: 'Automatic', available: true },
  { _id: '6', name: 'City', brand: 'Honda', year: 2022, type: 'Sedan', pricePerDay: 2000, seats: 5, fuel: 'Petrol', transmission: 'Automatic', available: true },
]

export default function Cars() {
  const [cars, setCars] = useState(DEMO_CARS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedFuel, setSelectedFuel] = useState('All')
  const [sortBy, setSortBy] = useState('price_asc')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      try {
        const { data } = await carAPI.getAll()
        if (data?.cars?.length) setCars(data.cars)
      } catch {
        // use demo data
      } finally {
        setLoading(false)
      }
    }
    fetchCars()
  }, [])

  const filtered = cars
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.brand.toLowerCase().includes(search.toLowerCase())) return false
      if (selectedType !== 'All' && c.type !== selectedType) return false
      if (selectedFuel !== 'All' && c.fuel !== selectedFuel) return false
      if (c.pricePerDay < priceRange[0] || c.pricePerDay > priceRange[1]) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerDay - b.pricePerDay
      if (sortBy === 'price_desc') return b.pricePerDay - a.pricePerDay
      if (sortBy === 'year_desc') return b.year - a.year
      return 0
    })

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-subtitle mb-3">Our Fleet</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="section-title">BROWSE CARS</motion.h1>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or brand..."
              className="input-field pl-11"
            />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="input-field md:w-56 appearance-none cursor-pointer">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost flex items-center gap-2 ${showFilters ? 'border-brand-500 text-brand-400' : ''}`}>
            <FiFilter size={16} /> Filters
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type */}
            <div>
              <label className="text-white/50 text-xs font-mono uppercase tracking-widest mb-3 block">Car Type</label>
              <div className="flex flex-wrap gap-2">
                {CAR_TYPES.map((t) => (
                  <button key={t} onClick={() => setSelectedType(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-heading transition-all ${
                      selectedType === t ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Fuel */}
            <div>
              <label className="text-white/50 text-xs font-mono uppercase tracking-widest mb-3 block">Fuel Type</label>
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPES.map((f) => (
                  <button key={f} onClick={() => setSelectedFuel(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-heading transition-all ${
                      selectedFuel === f ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {/* Price range */}
            <div>
              <label className="text-white/50 text-xs font-mono uppercase tracking-widest mb-3 block">
                Max Price: ₹{priceRange[1].toLocaleString('en-IN')}/day
              </label>
              <input type="range" min={500} max={10000} step={100}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-brand-500"
              />
            </div>
          </motion.div>
        )}

        {/* Type quick tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {CAR_TYPES.map((t) => (
            <button key={t} onClick={() => setSelectedType(t)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-heading border transition-all ${
                selectedType === t
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-white/15 text-white/50 hover:border-brand-500/50 hover:text-white/80'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/40 text-sm font-mono">
            {filtered.length} car{filtered.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
          {(search || selectedType !== 'All' || selectedFuel !== 'All') && (
            <button onClick={() => { setSearch(''); setSelectedType('All'); setSelectedFuel('All') }}
              className="flex items-center gap-1 text-brand-400 text-sm hover:text-brand-300 transition-colors">
              <FiX size={14} /> Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-80 shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="font-heading font-bold text-white text-xl mb-2">No cars found</h3>
            <p className="text-white/40">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((car, i) => (
              <CarCard key={car._id} car={car} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
