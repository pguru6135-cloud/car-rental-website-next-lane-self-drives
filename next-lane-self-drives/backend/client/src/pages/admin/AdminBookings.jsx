import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { bookingAPI } from '../../utils/api'
import { formatCurrency } from '../../utils/pricing'
import toast from 'react-hot-toast'
import { FiEye, FiImage, FiUser, FiShield, FiFileText, FiCreditCard, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const STATUS_OPTIONS = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  active: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  completed: 'bg-white/10 text-white/50 border-white/20',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await bookingAPI.getAll()
      if (data.bookings) setBookings(data.bookings)
    } catch {
      toast.error('Could not load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status)
      setBookings(b => b.map(x => x._id === id ? { ...x, status } : x))
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Update failed')
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
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
                <th className="px-4 py-4 w-10"></th>
                {['Customer', 'Car', 'Dates', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-4 text-left text-white/30 text-xs font-mono uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <React.Fragment key={b._id}>
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer ${expandedId === b._id ? 'bg-white/5' : ''}`}
                    onClick={() => toggleExpand(b._id)}>
                    <td className="px-4 py-4 text-white/30">
                      {expandedId === b._id ? <FiChevronUp /> : <FiChevronDown />}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {b.user?.avatar ? (
                          <img src={b.user.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-xs"><FiUser /></div>
                        )}
                        <div>
                          <div className="text-white font-heading font-semibold text-sm">{b.user?.name || b.name}</div>
                          <div className="text-white/30 text-xs font-mono">{b.user?.phone || b.phone}</div>
                        </div>
                      </div>
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
                      <div onClick={e => e.stopPropagation()}>
                        <select value={b.status} onChange={e => handleStatusChange(b._id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-body outline-none hover:border-brand-500/40 transition-colors cursor-pointer">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expandable Details Area */}
                  <AnimatePresence>
                    {expandedId === b._id && (
                      <tr>
                        <td colSpan="7" className="p-0 border-b border-white/10">
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-black/20">
                            <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                              
                              {/* Aadhaar */}
                              <div className="space-y-2">
                                <label className="text-white/30 text-[10px] font-mono uppercase tracking-tighter flex items-center gap-1.5"><FiShield size={12} /> Aadhaar Verification</label>
                                {b.user?.aadhaar?.image ? (
                                  <div className="space-y-2">
                                    <div className="text-white text-xs font-heading">ID: {b.user.aadhaar.number || 'N/A'}</div>
                                    <a href={b.user.aadhaar.image} target="_blank" rel="noreferrer" className="block relative group">
                                      <img src={b.user.aadhaar.image} className="w-full h-32 object-cover rounded-xl border border-white/10 hover:border-brand-500/50 transition-colors" alt="Aadhaar" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                        <FiEye className="text-white" />
                                      </div>
                                    </a>
                                  </div>
                                ) : <div className="text-white/20 text-xs py-4 border border-dashed border-white/10 rounded-xl text-center">No Aadhaar</div>}
                              </div>

                              {/* DL */}
                              <div className="space-y-2">
                                <label className="text-white/30 text-[10px] font-mono uppercase tracking-tighter flex items-center gap-1.5"><FiFileText size={12} /> Driving License</label>
                                {b.user?.drivingLicense?.image ? (
                                  <div className="space-y-2">
                                    <div className="text-white text-xs font-heading">ID: {b.user.drivingLicense.number || 'N/A'}</div>
                                    <a href={b.user.drivingLicense.image} target="_blank" rel="noreferrer" className="block relative group">
                                      <img src={b.user.drivingLicense.image} className="w-full h-32 object-cover rounded-xl border border-white/10 hover:border-brand-500/50 transition-colors" alt="DL" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                        <FiEye className="text-white" />
                                      </div>
                                    </a>
                                  </div>
                                ) : <div className="text-white/20 text-xs py-4 border border-dashed border-white/10 rounded-xl text-center">No License</div>}
                              </div>

                              {/* Passport Photo */}
                              <div className="space-y-2">
                                <label className="text-white/30 text-[10px] font-mono uppercase tracking-tighter flex items-center gap-1.5"><FiImage size={12} /> Passport Photo</label>
                                {b.user?.passportPhoto ? (
                                  <a href={b.user.passportPhoto} target="_blank" rel="noreferrer" className="block relative group">
                                    <img src={b.user.passportPhoto} className="w-full h-32 object-cover rounded-xl border border-white/10 hover:border-brand-500/50 transition-colors" alt="Passport" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                      <FiEye className="text-white" />
                                    </div>
                                  </a>
                                ) : <div className="text-white/20 text-xs py-4 border border-dashed border-white/10 rounded-xl text-center">No Passport Photo</div>}
                              </div>

                              {/* Payment Screenshot */}
                              <div className="space-y-2">
                                <label className="text-white/30 text-[10px] font-mono uppercase tracking-tighter flex items-center gap-1.5"><FiCreditCard size={12} /> Payment Receipt</label>
                                {b.payment?.screenshot ? (
                                  <div className="space-y-2">
                                    <div className="text-white text-xs font-heading truncate">Txn: {b.payment.transactionId || 'N/A'}</div>
                                    <a href={b.payment.screenshot} target="_blank" rel="noreferrer" className="block relative group">
                                      <img src={b.payment.screenshot} className="w-full h-32 object-cover rounded-xl border border-white/10 hover:border-brand-500/50 transition-colors" alt="Payment" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                        <FiEye className="text-white" />
                                      </div>
                                    </a>
                                  </div>
                                ) : <div className="text-white/20 text-xs py-4 border border-dashed border-white/10 rounded-xl text-center">No Receipt</div>}
                              </div>

                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-white/30 font-body">No bookings found</div>
          )}
          {loading && (
             <div className="text-center py-12 text-white/10 font-mono animate-pulse uppercase tracking-widest text-sm">Loading Bookings...</div>
          )}
        </div>
      </div>
    </div>
  )
}

