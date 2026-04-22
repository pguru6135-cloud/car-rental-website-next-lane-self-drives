import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiStar, FiShield, FiClock, FiMapPin } from 'react-icons/fi'
import CarCard from '../components/CarCard'
import heroCar from '../assets/hero-car.jpg'

const FEATURED_CARS = [
  { _id: '1', name: 'Swift Dzire', brand: 'Maruti', year: 2023, type: 'Sedan', pricePerDay: 1800, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: true },
  { _id: '2', name: 'Creta', brand: 'Hyundai', year: 2023, type: 'SUV', pricePerDay: 2800, seats: 5, fuel: 'Diesel', transmission: 'Automatic', available: true },
  { _id: '3', name: 'i20', brand: 'Hyundai', year: 2022, type: 'Hatchback', pricePerDay: 1400, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: false },
]

const FEATURES = [
  { icon: <FiShield />, title: 'Fully Insured', desc: 'Every vehicle is comprehensively insured.' },
  { icon: <FiClock />, title: 'Flexible Hours', desc: 'Pick up and drop off on your schedule.' },
  { icon: <FiMapPin />, title: 'Tirupur-wide', desc: 'Free delivery within Tirupur city.' },
  { icon: <FiStar />, title: 'Premium Fleet', desc: 'Well-maintained and modern vehicles.' },
]

function MouseRotateCar({ src }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20
    setRotate({ x, y })
  }

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 })

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: '1000px' }}
    >
      <motion.img
        src={src}
        alt="Next Lane Car"
        animate={{ rotateY: rotate.x, rotateX: rotate.y, y: [0, -10, 0] }}
        transition={{
          rotateY: { duration: 0.1 },
          rotateX: { duration: 0.1 },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="w-full object-contain"
        style={{ filter: 'drop-shadow(0 0 60px rgba(249,115,22,0.6))', transformStyle: 'preserve-3d' }}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 h-8 bg-brand-500/30 rounded-full blur-3xl" />
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="orb orb-orange w-[600px] h-[600px] top-1/2 left-1/4 -translate-y-1/2 opacity-30" />
        <div className="orb orb-purple w-[400px] h-[400px] bottom-0 right-0 opacity-20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="section-subtitle mb-4">tirupur's Premium</motion.p>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-white tracking-wider leading-none mb-6"
              style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}>
              DRIVE YOUR<br /><span className="text-brand-500">OWN WAY</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-white/50 font-body text-lg leading-relaxed max-w-md mb-8">
              Self-drive rentals that put you in control. Choose from our premium fleet and experience true freedom on the road.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4">
              <Link to="/cars" className="btn-primary flex items-center gap-2">
                Explore Cars <FiArrowRight />
              </Link>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2">WhatsApp Us</a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
              {[['200+','Happy Customers'],['15+','Cars Available'],['4.9★','Average Rating'],['24/7','Support']].map(([val, label]) => (
                <div key={label}>
                  <div className="font-display text-brand-400 text-2xl">{val}</div>
                  <div className="text-white/40 text-xs font-body mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative h-[400px] lg:h-[520px]">
            <MouseRotateCar src={heroCar} />
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-subtitle mb-4">Why Choose Us</p>
            <h2 className="section-title">THE NEXT LANE<br />DIFFERENCE</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 text-2xl mx-auto mb-4">{f.icon}</div>
                <h3 className="font-heading font-bold text-white mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CARS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-subtitle mb-3">Our Fleet</p>
              <h2 className="section-title">POPULAR<br />CARS</h2>
            </div>
            <Link to="/cars" className="btn-ghost hidden md:flex items-center gap-2">View All <FiArrowRight /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CARS.map((car, i) => <CarCard key={car._id} car={car} index={i} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-500/10" />
        <div className="orb orb-orange w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <h2 className="section-title mb-6">READY TO ROLL?</h2>
          <p className="text-white/50 font-body text-lg mb-8">Book your self-drive experience today!</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/cars" className="btn-primary flex items-center gap-2 text-lg px-10">Book Now <FiArrowRight /></Link>
            <a href="https://www.instagram.com/next_lane_self_drives" target="_blank" rel="noopener noreferrer"
              className="btn-ghost flex items-center gap-2">📸 Instagram</a>
          </div>
        </motion.div>
      </section>
    </main>
  )
}