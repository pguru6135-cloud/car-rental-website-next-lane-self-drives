import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../../utils/api'
import QRCode from 'react-qr-code'
import { FiCheckCircle, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'

export default function AdminWhatsApp() {
  const [status, setStatus] = useState({ isReady: false, lastQR: null })
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const { data } = await adminAPI.getWhatsAppStatus()
      setStatus(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="section-title text-left mb-2">WHATSAPP LINK</h1>
            <p className="text-white/40 font-body">Manage the automated notification system connection.</p>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchStatus(); }} 
            className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-brand-400"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Status Card */}
          <div className="glass-card p-8">
             <h2 className="font-heading font-bold text-white text-xl mb-6 flex items-center gap-2">
                Connection Status
             </h2>
             
             <div className="space-y-6">
                <div className={`p-6 rounded-2xl border flex items-center gap-4 ${status.isReady ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status.isReady ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-orange-500 text-white animate-pulse'}`}>
                      {status.isReady ? <FiCheckCircle size={24} /> : <FiAlertTriangle size={24} />}
                   </div>
                   <div>
                      <p className={`font-heading font-bold text-lg ${status.isReady ? 'text-green-400' : 'text-orange-400'}`}>
                         {status.isReady ? 'ACTIVE' : 'DISCONNECTED'}
                      </p>
                      <p className="text-white/40 text-xs">
                         {status.isReady ? 'System is sending messages normally.' : 'Link your WhatsApp account to enable automation.'}
                      </p>
                   </div>
                </div>

                <div className="glass rounded-xl p-6 space-y-3">
                   <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Details</p>
                   <div className="flex justify-between">
                      <span className="text-white/50 text-sm">Service</span>
                      <span className="text-white text-sm font-mono">whatsapp-web.js</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-white/50 text-sm">Mode</span>
                      <span className="text-white text-sm font-mono">Headless (Admin)</span>
                   </div>
                </div>
             </div>
          </div>

          {/* QR Code Card */}
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
            {status.isReady ? (
              <div className="space-y-4">
                 <div className="w-32 h-32 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto text-brand-400">
                    <FiCheckCircle size={64} />
                 </div>
                 <h3 className="font-heading font-bold text-white text-2xl">Linked!</h3>
                 <p className="text-white/40 text-sm font-body max-w-xs mx-auto">
                    Your WhatsApp is already connected. You can now close this page. If you log out from your phone, the QR code will reappear here.
                 </p>
              </div>
            ) : status.lastQR ? (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl inline-block shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                   <QRCode value={status.lastQR} size={200} />
                </div>
                <div>
                   <h3 className="font-heading font-bold text-white text-xl mb-2">Scan to Link</h3>
                   <p className="text-white/40 text-sm font-body">1. Open WhatsApp on your phone</p>
                   <p className="text-white/40 text-sm font-body">2. Go to Settings {'>'} Linked Devices</p>
                   <p className="text-white/40 text-sm font-body">3. Select "Link a Device" and scan this code</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-10">
                 <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                 <p className="text-white/20 font-mono text-xs uppercase tracking-widest">Searching for QR...</p>
                 <p className="text-white/40 text-sm max-w-[200px] mx-auto">This may take a moment after the server restarts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
