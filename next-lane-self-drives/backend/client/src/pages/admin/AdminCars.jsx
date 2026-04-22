import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi'
import { carAPI } from '../../utils/api'
import { formatCurrency } from '../../utils/pricing'
import toast from 'react-hot-toast'

const EMPTY_CAR = {
  name: '', brand: '', year: new Date().getFullYear(), type: 'Sedan',
  pricePerDay: '', seats: 5, fuel: 'Petrol', transmission: 'Manual',
  mileage: '', color: '', description: '', image: '', available: true,
  features: [],
}
const FEATURE_OPTIONS = ['Sunroof', 'Rear Camera', 'Apple CarPlay', 'Android Auto', 'Climate Control', 'Cruise Control', 'Lane Assist', 'Parking Sensors', 'Keyless Entry', 'Bluetooth']

const DEMO_CARS = [
  { _id: '1', name: 'Swift Dzire', brand: 'Maruti', year: 2023, type: 'Sedan', pricePerDay: 1800, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: true },
  { _id: '2', name: 'Hyundai Creta', brand: 'Hyundai', year: 2023, type: 'SUV', pricePerDay: 2800, seats: 5, fuel: 'Diesel', transmission: 'Automatic', available: true },
  { _id: '3', name: 'Hyundai i20', brand: 'Hyundai', year: 2022, type: 'Hatchback', pricePerDay: 1400, seats: 5, fuel: 'Petrol', transmission: 'Manual', available: false },
]

export default function AdminCars() {
  const [cars, setCars] = useState(DEMO_CARS)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [editCar, setEditCar] = useState(null)
  const [form, setForm] = useState(EMPTY_CAR)

  useEffect(() => {
    carAPI.getAll().then(({ data }) => { if (data.cars?.length) setCars(data.cars) }).catch(() => {})
  }, [])

  const openAdd = () => { setForm(EMPTY_CAR); setEditCar(null); setModal('add') }
  const openEdit = (car) => { setForm({ ...car, features: car.features || [] }); setEditCar(car); setModal('edit') }
  const closeModal = () => { setModal(null); setEditCar(null) }

  const handleSave = async () => {
    if (!form.name || !form.pricePerDay) { toast.error('Name and price are required'); return }
    setLoading(true)
    try {
      if (modal === 'edit') {
        await carAPI.update(editCar._id, form)
        setCars(c => c.map(x => x._id === editCar._id ? { ...x, ...form } : x))
        toast.success('Car updated')
      } else {
        const { data } = await carAPI.create(form)
        setCars(c => [...c, data.car || { ...form, _id: Date.now().toString() }])
        toast.success('Car added')
      }
      closeModal()
    } catch {
      toast.error('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this car?')) return
    try {
      await carAPI.delete(id)
      setCars(c => c.filter(x => x._id !== id))
      toast.success('Car deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const toggleFeature = (f) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f]
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-white text-4xl tracking-widest mb-1">CARS</h1>
          <p className="text-white/30 font-mono text-sm">{cars.length} vehicles in fleet</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Car
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Car', 'Type', 'Price/Day', 'Fuel', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-4 text-left text-white/30 text-xs font-mono uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cars.map((car, i) => (
                <motion.tr key={car._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-heading font-semibold text-white">{car.name}</div>
                    <div className="text-white/30 text-xs">{car.brand} · {car.year}</div>
                  </td>
                  <td className="px-4 py-4"><span className="badge">{car.type}</span></td>
                  <td className="px-4 py-4 text-brand-400 font-heading font-bold">{formatCurrency(car.pricePerDay)}</td>
                  <td className="px-4 py-4 text-white/50 text-sm">{car.fuel}</td>
                  <td className="px-4 py-4">
                    <span className={`badge ${car.available ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {car.available ? 'Available' : 'Booked'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(car)}
                        className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white/50 hover:text-brand-400 transition-colors">
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(car._id)}
                        className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white/50 hover:text-red-400 transition-colors">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-white text-xl">{modal === 'edit' ? 'Edit Car' : 'Add New Car'}</h2>
                <button onClick={closeModal} className="text-white/30 hover:text-white"><FiX size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Car Name', type: 'text', span: 2 },
                  { key: 'brand', label: 'Brand', type: 'text' },
                  { key: 'year', label: 'Year', type: 'number' },
                  { key: 'pricePerDay', label: 'Price/Day (₹)', type: 'number' },
                  { key: 'seats', label: 'Seats', type: 'number' },
                  { key: 'mileage', label: 'Mileage', type: 'text' },
                  { key: 'color', label: 'Color', type: 'text' },
                  { key: 'image', label: 'Image URL', type: 'text', span: 2 },
                  { key: 'description', label: 'Description', type: 'textarea', span: 2 },
                ].map(f => (
                  <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                    <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        rows={3} className="input-field resize-none" />
                    ) : (
                      <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="input-field" />
                    )}
                  </div>
                ))}

                {/* Dropdowns */}
                {[
                  { key: 'type', label: 'Type', options: ['Sedan', 'SUV', 'Hatchback', 'MPV'] },
                  { key: 'fuel', label: 'Fuel', options: ['Petrol', 'Diesel', 'Electric', 'CNG'] },
                  { key: 'transmission', label: 'Transmission', options: ['Manual', 'Automatic', 'AMT'] },
                ].map(s => (
                  <div key={s.key}>
                    <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">{s.label}</label>
                    <select value={form[s.key]} onChange={e => setForm({ ...form, [s.key]: e.target.value })}
                      className="input-field appearance-none cursor-pointer">
                      {s.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}

                {/* Available toggle */}
                <div className="flex items-center gap-3 py-2">
                  <label className="text-white/50 text-xs font-mono uppercase tracking-widest">Available</label>
                  <button onClick={() => setForm({ ...form, available: !form.available })}
                    className={`w-12 h-6 rounded-full transition-colors ${form.available ? 'bg-green-500' : 'bg-white/20'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.available ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Features */}
                <div className="col-span-2">
                  <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-3">Features</label>
                  <div className="flex flex-wrap gap-2">
                    {FEATURE_OPTIONS.map(f => (
                      <button key={f} onClick={() => toggleFeature(f)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          form.features.includes(f) ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' : 'border-white/10 text-white/40 hover:border-white/30'
                        }`}>
                        {form.features.includes(f) && <FiCheck size={11} />} {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
                <button onClick={handleSave} disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Saving...' : modal === 'edit' ? 'Update Car' : 'Add Car'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
