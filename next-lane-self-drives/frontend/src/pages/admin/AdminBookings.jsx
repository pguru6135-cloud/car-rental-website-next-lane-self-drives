import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { bookingAPI } from '../../utils/api'
import { formatCurrency } from '../../utils/pricing'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  active: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  completed: 'bg-white/10 text-white/50 border-white/20',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const DEMO_BOOKINGS = [
  { _id: 'b1', car: { name: 'Hyundai Creta' }, user: { name: 'Karthik R', phone: '9876543210' }, pickupDate: new Date(), returnDate: new Date(Date.now() + 86400000*3), totalAmount: 8400, status: 'confirmed' },
  { _id: 'b2', car: { name: 'Swift Dzire' }, user: { name: 'Priya S', phone: '9876543211' }, pickupDate: new Date(), returnDate: new Date(Date.now() + 86400000), totalAmount: 1800, status: 'pending' },
  { _id: 'b3', car: { name: 'Baleno' }, user: { name: 'Ravi M', phone: '9876543212' }, pickupDate: new Date(Date.now() - 86400000*2), returnDate: new Date(Date.now() - 86400000), totalAmount: 2600, status: 'completed' },
]

export default function AdminBookings() {
  const [bookings, setBookings] = useState(DEMO_BOOKINGS)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    bookingAPI.getAll().then(({ data }) => { if (data.bookings?.length) setBookings(data.bookings) }).catch(() => {})
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status)
      setBookings(b => b.map(x => x._id === id ? { ...x, status } : x))
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Update failed')
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-white text-4xl tracking-widest mb-1">BOOKINGS</h1>
        <p className="text-white/30 font-mono text-sm">{bookings.length} total bookings</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-heading capitalize border transition-all ${
              filter === s ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' : 'border-white/10 text-white/40 hover:text-white/70'
            }`}>
            {s} {s === 'all' && `(${bookings.length})`}
            {s !== 'all' && `(${bookings.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Customer', 'Car', 'Dates', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-4 text-left text-white/30 text-xs font-mono uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-4">
                    <div className="text-white font-heading font-semibold text-sm">{b.user?.name}</div>
                    <div className="text-white/30 text-xs font-mono">{b.user?.phone}</div>
                  </td>
                  <td className="px-4 py-4 text-white/70 text-sm">{b.car?.name}</td>
                  <td className="px-4 py-4">
                    <div className="text-white/70 text-xs">{format(new Date(b.pickupDate), 'dd MMM')}</div>
                    <div className="text-white/30 text-xs">→ {format(new Date(b.returnDate), 'dd MMM')}</div>
                  </td>
                  <td className="px-4 py-4 text-brand-400 font-heading font-bold text-sm">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-4">
                    <span className={`badge text-xs ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <select value={b.status} onChange={e => handleStatusChange(b._id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-body outline-none hover:border-brand-500/40 transition-colors cursor-pointer">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/30 font-body">No bookings found</div>
          )}
        </div>
      </div>
    </div>
  )
}
