import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheck, FiCalendar, FiPhone, FiMessageCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { bookingAPI } from '../utils/api'
import { formatCurrency } from '../utils/pricing'
import { format } from 'date-fns'

export default function BookingConfirm() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)

  const [resending, setResending] = useState(false)

  useEffect(() => {
    bookingAPI.getOne(id).then(({ data }) => setBooking(data.booking)).catch(() => {})
  }, [id])

  const handleResend = async () => {
    setResending(true)
    try {
      await bookingAPI.resendWhatsApp(id)
      toast.success('WhatsApp notification resent!')
    } catch (err) {
      toast.error('Failed to resend. Please chat with us directly.')
    } finally {
      setResending(false)
    }
  }

  const whatsappUrl = `https://wa.me/919342179459?text=${encodeURIComponent(
    `Hi Next Lane! I just booked a car (ID: #${booking?._id?.slice(-8).toUpperCase()}). Looking forward to the ride!`
  )}`

  return (
    <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
      <div className="max-w-xl w-full px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 text-center relative overflow-hidden"
        >
          {/* Decorative background orb */}
          <div className="orb orb-orange w-64 h-64 -top-32 -left-32 opacity-20" />

          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-24 h-24 bg-brand-500/10 border-2 border-brand-500/30 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10"
          >
            <FiCheck size={48} className="text-brand-400" />
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-brand-500 rounded-full"
            />
          </motion.div>

          <h1 className="font-display text-white text-5xl tracking-[0.2em] mb-3">BOOKED!</h1>
          <p className="text-white/40 font-body text-sm mb-8 leading-relaxed">
            Your booking is being processed. We've automatically sent a confirmation message to your WhatsApp number.
          </p>

          {booking && (
            <div className="glass rounded-2xl p-6 mb-8 text-left space-y-4 border border-white/5 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-[3px] mb-1">Booking ID</p>
                  <p className="text-brand-400 font-display text-xl leading-none">#{booking._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                   <p className="text-white/30 text-[10px] font-mono uppercase tracking-[3px] mb-1">Total Paid</p>
                   <p className="text-white font-heading font-bold text-xl leading-none">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
              
              <div className="h-px bg-white/5" />

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <FiCalendar className="text-brand-400" size={14} />
                       <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Pickup</span>
                    </div>
                    <p className="text-white text-xs font-body">{format(new Date(booking.pickupDate), 'dd MMM, hh:mm aa')}</p>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <FiCalendar className="text-brand-400" size={14} />
                       <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Return</span>
                    </div>
                    <p className="text-white text-xs font-body">{format(new Date(booking.returnDate), 'dd MMM, hh:mm aa')}</p>
                 </div>
              </div>
            </div>
          )}

          {/* WhatsApp Notification Status */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                  <FiMessageCircle size={20} />
               </div>
               <div className="text-left">
                  <p className="text-green-400 font-heading font-bold text-sm">WhatsApp Sent</p>
                  <p className="text-green-400/50 text-[10px]">Check your messages for confirmation</p>
               </div>
            </div>
            <button 
              onClick={handleResend}
              disabled={resending}
              className="text-xs font-heading font-semibold text-white/40 hover:text-white transition-colors underline underline-offset-4"
            >
              {resending ? 'Sending...' : 'Resend?'}
            </button>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <Link to="/dashboard" className="btn-primary py-4 text-lg">My Dashboard</Link>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-ghost py-4 border border-white/10 hover:border-brand-500/40 flex items-center justify-center gap-3"
            >
              <FiPhone className="text-brand-400" />
              <span>Chat with Us (WhatsApp)</span>
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
