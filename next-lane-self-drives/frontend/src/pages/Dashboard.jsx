import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { FiCalendar, FiClock, FiX, FiChevronRight, FiCreditCard, FiUpload, FiCheckCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { bookingAPI, authAPI } from '../utils/api'
import { formatCurrency } from '../utils/pricing'
import { useAuthStore } from '../hooks/useStore'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  active: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  completed: 'bg-white/10 text-white/50 border-white/20',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Document upload state
  const [profile, setProfile] = useState(null)
  const [docLoading, setDocLoading] = useState(false)
  const [aadhaarNum, setAadhaarNum] = useState('')
  const [dlNum, setDlNum] = useState('')
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [dlFile, setDlFile] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [passportFile, setPassportFile] = useState(null)

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getProfile()
      setProfile(data.user)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await bookingAPI.getMyBookings()
      setBookings(data.bookings)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchBookings() 
    fetchProfile()
  }, [])

  const handleUploadDocs = async () => {
    setDocLoading(true)
    try {
      const formData = new FormData()
      if (aadhaarNum) formData.append('aadhaarNumber', aadhaarNum)
      if (dlNum) formData.append('dlNumber', dlNum)
      if (aadhaarFile) formData.append('aadhaarImage', aadhaarFile)
      if (dlFile) formData.append('dlImage', dlFile)
      if (avatarFile) formData.append('avatar', avatarFile)
      if (passportFile) formData.append('passportPhoto', passportFile)

      await authAPI.uploadDocuments(formData)
      toast.success('Documents uploaded successfully!')
      fetchProfile()
      setAadhaarFile(null)
      setDlFile(null)
      setAvatarFile(null)
      setPassportFile(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setDocLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await bookingAPI.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch {
      toast.error('Could not cancel booking')
    }
  }

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['pending', 'confirmed', 'active'].includes(b.status)).length,
    spent: bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalAmount, 0),
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="section-subtitle mb-2">Welcome back</p>
          <h1 className="font-display text-white text-5xl tracking-widest">{user?.name?.toUpperCase()}</h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Bookings', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Total Spent', value: formatCurrency(stats.spent) },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center">
              <div className="price-tag text-2xl">{s.value}</div>
              <div className="text-white/40 text-xs font-mono mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Identity & Documents */}
        <h2 className="font-heading font-bold text-white text-xl mb-4">Identity & Documents</h2>
        <div className="glass-card p-6 mb-10 border border-brand-500/20">
          {profile?.aadhaar?.image && profile?.drivingLicense?.image && profile?.avatar && profile?.passportPhoto ? (
            <div className="flex items-center gap-4 text-green-400">
              <FiCheckCircle size={24} />
              <div>
                <p className="font-heading font-bold font-lg text-white">Verification Complete</p>
                <p className="text-white/50 text-sm">Your Aadhaar, Driving License, Photo, and Passport Photo have been uploaded successfully.</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-white/50 text-sm mb-6">Please upload your documents (Aadhaar, DL, User Photo, and Passport Photo) to quickly process your bookings.</p>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                
                {/* Aadhaar */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white font-heading font-bold mb-2">Aadhaar Details</p>
                  {profile?.aadhaar?.image ? (
                    <p className="text-green-400 text-xs flex items-center gap-1"><FiCheckCircle /> Aadhaar Uploaded</p>
                  ) : (
                    <div className="space-y-3">
                      <input value={aadhaarNum} onChange={(e) => setAadhaarNum(e.target.value)} placeholder="Aadhaar Number" className="input-field w-full py-2 text-sm" />
                      <input type="file" accept="image/*" onChange={(e) => setAadhaarFile(e.target.files[0])} className="w-full text-white/50 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white" />
                    </div>
                  )}
                </div>

                {/* DL */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white font-heading font-bold mb-2">Driving License</p>
                  {profile?.drivingLicense?.image ? (
                    <p className="text-green-400 text-xs flex items-center gap-1"><FiCheckCircle /> DL Uploaded</p>
                  ) : (
                    <div className="space-y-3">
                      <input value={dlNum} onChange={(e) => setDlNum(e.target.value)} placeholder="DL Number" className="input-field w-full py-2 text-sm" />
                      <input type="file" accept="image/*" onChange={(e) => setDlFile(e.target.files[0])} className="w-full text-white/50 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white" />
                    </div>
                  )}
                </div>
                
                {/* User Photo */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 md:col-span-2">
                  <p className="text-white font-heading font-bold mb-2">User Photo</p>
                  {profile?.avatar ? (
                    <div className="flex items-center gap-4">
                      <img src={profile.avatar} alt="User" className="w-12 h-12 rounded-full object-cover border border-white/20" />
                      <p className="text-green-400 text-xs flex items-center gap-1"><FiCheckCircle /> Photo Uploaded</p>
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="w-full text-white/50 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white" />
                  )}
                </div>

                {/* Passport Photo */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 md:col-span-2">
                  <p className="text-white font-heading font-bold mb-2">Passport Photo</p>
                  {profile?.passportPhoto ? (
                    <div className="flex items-center gap-4">
                      <img src={profile.passportPhoto} alt="Passport" className="w-12 h-12 rounded-xl object-cover border border-white/20" />
                      <p className="text-green-400 text-xs flex items-center gap-1"><FiCheckCircle /> Passport Photo Uploaded</p>
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={(e) => setPassportFile(e.target.files[0])} className="w-full text-white/50 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white" />
                  )}
                </div>

              </div>
              
              {(!profile?.aadhaar?.image || !profile?.drivingLicense?.image || !profile?.avatar || !profile?.passportPhoto) && (
                <button onClick={handleUploadDocs} disabled={docLoading} className="btn-primary w-full md:w-auto py-2.5 px-6 text-sm flex items-center justify-center gap-2 m-auto">
                  {docLoading ? 'Uploading...' : <><FiUpload /> Upload Documents</>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bookings */}
        <h2 className="font-heading font-bold text-white text-xl mb-4">My Bookings</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-24 shimmer" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="font-heading font-bold text-white mb-2">No bookings yet</h3>
            <p className="text-white/40 text-sm mb-6">Your bookings will appear here</p>
            <a href="/cars" className="btn-primary inline-block">Browse Cars</a>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🚗</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-white truncate">{b.car?.name || 'Car'}</h3>
                    <span className={`badge text-xs ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/40 text-xs font-mono">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={11} /> {format(new Date(b.pickupDate), 'dd MMM')}
                    </span>
                    <span>→</span>
                    <span>{format(new Date(b.returnDate), 'dd MMM')}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  <div className="text-brand-400 font-heading font-bold">{formatCurrency(b.totalAmount)}</div>
                  <div className="flex items-center gap-3 mt-1">
                    {b.status === 'pending' && (
                      <Link to={`/booking/payment/${b._id}`}
                        className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                        <FiCreditCard size={12} /> Pay Now
                      </Link>
                    )}
                    {['pending', 'confirmed'].includes(b.status) && (
                      <button onClick={() => handleCancel(b._id)}
                        className="text-red-400 text-xs hover:text-red-300 transition-colors flex items-center gap-1">
                        <FiX size={11} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
