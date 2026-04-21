import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiSend } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Message sent! We\'ll reply within 24 hours.')
    setForm({ name: '', email: '', phone: '', message: '' })
    setSending(false)
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-subtitle mb-3">Get in Touch</p>
          <h1 className="section-title mb-12">CONTACT US</h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left – info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading font-bold text-white text-2xl mb-6">We're here to help</h2>
              <p className="text-white/50 font-body leading-relaxed">
                Have questions about renting a car? Need help with your booking? Reach out through any of the channels below — we typically respond within 15 minutes during business hours.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: <FiPhone />, label: 'Phone', value: '+91 9342179459', href: 'tel:+919342179459' },
                { icon: <FiMail />, label: 'Email', value: 'pguru6135@gmail.com', href: 'mailto:pguru6135@gmail.com' },
                { icon: <FiMapPin />, label: 'Location', value: 'Tirupur, Tamil Nadu, India', href: null },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white font-heading font-semibold hover:text-brand-400 transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white font-heading font-semibold">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <h3 className="font-heading font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/next_lane_self_drives" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 glass px-4 py-3 rounded-xl text-white/60 hover:text-pink-400 hover:border-pink-500/40 transition-all text-sm font-heading">
                  <FiInstagram /> @next_lane_self_drives
                </a>
                <a href="https://wa.me/919342179459" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 glass px-4 py-3 rounded-xl text-white/60 hover:text-green-400 hover:border-green-500/40 transition-all text-sm font-heading">
                  <FaWhatsapp /> WhatsApp
                </a>
              </div>
            </div>

            {/* Map embed */}
            <div className="glass-card overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4330.322695789767!2d77.37502850928247!3d11.109927060721075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9071f317ba993%3A0x6d5280730b381a02!2sNext%20Lane%20Self%20drives!5e0!3m2!1sen!2sin!4v1774184597980!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Next Lane Location"
              />
            </div>
          </div>

          {/* Right – form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-card p-8">
              <h2 className="font-heading font-bold text-white text-xl mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com" className="input-field" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765..." className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">Message *</label>
                  <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help..." rows={5} className="input-field resize-none" />
                </div>
                <button type="submit" disabled={sending}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {sending ? 'Sending...' : <><FiSend /> Send Message</>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
