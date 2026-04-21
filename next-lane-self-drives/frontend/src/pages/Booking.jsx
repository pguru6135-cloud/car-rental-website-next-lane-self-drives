import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import { carAPI, bookingAPI, adminAPI } from '../utils/api'
import { calculatePrice, formatCurrency } from '../utils/pricing'
import { useAuthStore } from '../hooks/useStore'
import { addHours, isAfter } from 'date-fns'
import { FiCalendar, FiUser, FiPhone, FiInfo } from 'react-icons/fi'

const DEMO_CAR = { _id: '2', name: 'Hyundai Creta', brand: 'Hyundai', pricePerDay: 2800, type: 'SUV' }

export default function Booking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [qrImage, setQrImage] = useState(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    pickupDate: addHours(new Date(), 2),
    returnDate: addHours(new Date(), 26),
    pickupLocation: 'Tirupur (Office)',
    notes: '',
  })

  const pricing = calculatePrice(car, form.pickupDate, form.returnDate)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [carRes, settingsRes] = await Promise.allSettled([
          carAPI.getOne(id),
          adminAPI.getPaymentSettings(),
        ])
        if (carRes.status === 'fulfilled') setCar(carRes.value.data.car)
        else setCar({ ...DEMO_CAR, _id: id })
        if (settingsRes.status === 'fulfilled') setQrImage(settingsRes.value.data.qrImage)
      } catch {
        setCar({ ...DEMO_CAR, _id: id })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!isAfter(form.returnDate, form.pickupDate)) {
      toast.error('Return date must be after pickup date')
      return
    }
    confirmBooking()
  }

  const confirmBooking = async () => {
    setSubmitting(true)
    try {
      const { data } = await bookingAPI.create({
        car: id,
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        pickupLocation: form.pickupLocation,
        notes: form.notes,
        totalAmount: pricing.total,
        name: form.name,
        email: form.email,
        phone: form.phone,
      })
      toast.success('Details submitted! Proceeding to Payment...')
      navigate(`/booking/payment/${data.booking._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen pt-28 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-subtitle mb-3">Reserve Your Ride</p>
          <h1 className="section-title mb-10">BOOK NOW</h1>
        </motion.div>

        {/* Step indicators */}
        <div className="flex items-center gap-4 mb-10">
          {['Details', 'Payment'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i === 0 ? 'text-white' : 'text-white/30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading border ${
                  i === 0 ? 'border-brand-500 text-brand-400' : 'border-white/20'
                }`}>{i + 1}</div>
                <span className="font-heading text-sm">{s}</span>
              </div>
              {i < 1 && <div className="flex-1 h-px bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Personal info */}
                <div className="glass-card p-6">
                  <h2 className="font-heading font-bold text-white text-lg mb-5 flex items-center gap-2">
                    <FiUser className="text-brand-400" /> Personal Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Full Name *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name" className="input-field" />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Phone *</label>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Email Address *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com" className="input-field" />
                  </div>
                </div>

                {/* Date selection */}
                <div className="glass-card p-6">
                  <h2 className="font-heading font-bold text-white text-lg mb-5 flex items-center gap-2">
                    <FiCalendar className="text-brand-400" /> Trip Dates
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Pickup Date & Time *</label>
                      <DatePicker
                        selected={form.pickupDate}
                        onChange={(date) => setForm({ ...form, pickupDate: date })}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="dd MMM yyyy, hh:mm aa"
                        minDate={new Date()}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Return Date & Time *</label>
                      <DatePicker
                        selected={form.returnDate}
                        onChange={(date) => setForm({ ...form, returnDate: date })}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="dd MMM yyyy, hh:mm aa"
                        minDate={form.pickupDate}
                        className="input-field w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & notes */}
                <div className="glass-card p-6">
                  <h2 className="font-heading font-bold text-white text-lg mb-5 flex items-center gap-2">
                    <FiInfo className="text-brand-400" /> Additional Info
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Pickup Location</label>
                      <select value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                        className="input-field appearance-none cursor-pointer">
                        <option>Tirupur (Office)</option>
                        <option>Home Delivery (Tirupur city)</option>
                        <option>Tirupur Railway Station</option>
                        <option>Tirupur Airport</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Notes (optional)</label>
                      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Any special requests..." rows={3} className="input-field resize-none" />
                    </div>
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-4 text-lg disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Continue to Payment →'}
                </button>
              </motion.div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-28">
              <h3 className="font-heading font-bold text-white mb-4">Order Summary</h3>

              {car && (
                <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
                  <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-2xl">🚗</div>
                  <div>
                    <p className="text-white font-heading font-semibold text-sm">{car.name}</p>
                    <p className="text-white/40 text-xs">{car.type}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <Row label="Duration" value={`${pricing.days} day${pricing.days !== 1 ? 's' : ''}`} />
                <Row label="Base rate" value={formatCurrency(car?.pricePerDay || 0) + '/day'} />
                {pricing.breakdown?.filter(d => d.isWeekend).length > 0 && (
                  <Row label="Weekend surcharge" value="+30%" highlight />
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-heading font-bold">Total</span>
                  <span className="price-tag text-2xl">{formatCurrency(pricing.total)}</span>
                </div>
                <p className="text-white/20 text-xs mt-1 font-mono">incl. all charges</p>
              </div>

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-xs font-body">🛡️ Free cancellation up to 24hrs before pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40 text-sm font-body">{label}</span>
      <span className={`text-sm font-heading ${highlight ? 'text-brand-400' : 'text-white/80'}`}>{value}</span>
    </div>
  )
}
