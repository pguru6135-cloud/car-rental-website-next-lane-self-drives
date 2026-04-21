import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { bookingAPI, adminAPI } from '../utils/api'
import { formatCurrency } from '../utils/pricing'
import { FiCheckCircle } from 'react-icons/fi'

export default function PaymentVerification() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [booking, setBooking] = useState(null)
  const [qrImage, setQrImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('upi')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [bookingRes, settingsRes] = await Promise.all([
          bookingAPI.getOne(id),
          adminAPI.getPaymentSettings()
        ])
        setBooking(bookingRes.data.booking)
        setQrImage(settingsRes.data.qrImage)
        
        if (bookingRes.data.booking.payment?.status === 'paid') {
            toast.success("Payment already verified")
            navigate(`/booking/confirm/${id}`)
        }
      } catch (err) {
        toast.error("Failed to load payment details")
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  const handleVerify = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter the Transaction ID')
      return
    }
    if (!screenshot) {
      toast.error('Please upload your payment screenshot')
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('transactionId', transactionId)
      formData.append('screenshot', screenshot)
      
      await bookingAPI.verifyPayment(id, formData)
      toast.success('Payment details submitted! 🎉')
      navigate(`/booking/confirm/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.')
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
      <div className="max-w-2xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="section-subtitle mb-3">Complete Your Booking</p>
          <h1 className="section-title">PAYMENT</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-8 text-center border border-brand-500/20">
            {/* Payment Method Toggle */}
            <div className="flex justify-center gap-4 mb-8">
               <button onClick={() => setPaymentMethod('upi')} className={`px-6 py-2.5 rounded-xl font-heading text-sm transition-all ${paymentMethod === 'upi' ? 'bg-brand-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                 UPI / GPay
               </button>
               <button onClick={() => setPaymentMethod('bank')} className={`px-6 py-2.5 rounded-xl font-heading text-sm transition-all ${paymentMethod === 'bank' ? 'bg-brand-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                 Direct Bank Transfer
               </button>
            </div>

            <h2 className="font-heading font-bold text-white text-xl mb-2">
              Pay via {paymentMethod === 'upi' ? 'Google Pay / UPI' : 'Bank Transfer'}
            </h2>
            <p className="text-white/40 text-sm mb-6">
              {paymentMethod === 'upi' ? 'Scan the QR code and pay the exact amount shown' : 'Transfer the exact amount to the business bank account details below'}
            </p>

            {paymentMethod === 'upi' ? (
              /* QR Code */
              <div className="inline-flex flex-col items-center gap-4 mb-8">
                {qrImage ? (
                  <img src={qrImage} alt="GPay QR" className="w-48 h-48 rounded-2xl border border-white/10" />
                ) : (
                  <div className="w-48 h-48 glass rounded-2xl flex flex-col items-center justify-center gap-2">
                    <div className="text-5xl">📱</div>
                    <p className="text-white/30 text-sm font-mono">GPay QR Code</p>
                  </div>
                )}
                <div className="text-center mt-2">
                  <div className="price-tag text-4xl">{formatCurrency(booking?.totalAmount || 0)}</div>
                  <p className="text-white/30 text-xs font-mono mt-1">Total amount to pay</p>
                </div>
              </div>
            ) : (
              <div className="inline-flex flex-col items-center gap-4 mb-8 w-full max-w-sm">
                <div className="glass w-full rounded-2xl p-6 text-left border border-white/10">
                  <div className="mb-4">
                    <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-1">Bank Name</p>
                    <p className="text-white font-heading font-semibold text-lg">Next Lane Self Drives Bank</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-1">Account Number</p>
                    <p className="text-white font-heading font-semibold text-lg tracking-wider">1234 5678 9012 3456</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-1">IFSC Code</p>
                    <p className="text-white font-heading font-semibold text-lg">NXT0001234</p>
                  </div>
                </div>
                 <div className="text-center mt-2">
                  <div className="price-tag text-4xl">{formatCurrency(booking?.totalAmount || 0)}</div>
                  <p className="text-white/30 text-xs font-mono mt-1">Total amount to transfer</p>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
              <h3 className="font-heading font-bold text-white mb-4">Enter Transaction Details</h3>
              <p className="text-white/50 text-sm font-body mb-4">
                After completing the payment, please enter the Transaction ID / UTR Number below to verify your booking.
              </p>
              
              <div className="mb-4">
                <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Transaction ID / UTR *</label>
                <input 
                  value={transactionId} 
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g., 312345678901" 
                  className="input-field w-full" 
                  autoComplete="off"
                />
              </div>

              <div className="mb-6">
                <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Payment Screenshot *</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  className="w-full text-white/80 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-500/20 file:text-brand-400 hover:file:bg-brand-500/30 file:cursor-pointer pb-2"
                />
                {screenshot && (
                  <p className="text-xs text-green-400 mt-2">✓ Selected: {screenshot.name}</p>
                )}
              </div>

              <button 
                onClick={handleVerify} 
                disabled={submitting}
                className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {submitting ? 'Scanning Screenshot...' : <><FiCheckCircle size={20} /> Verify Payment</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
