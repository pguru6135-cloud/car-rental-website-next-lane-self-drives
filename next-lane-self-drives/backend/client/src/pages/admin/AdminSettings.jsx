import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiSave } from 'react-icons/fi'
import { adminAPI } from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [qrPreview, setQrPreview] = useState(null)
  const [qrFile, setQrFile] = useState(null)
  const [settings, setSettings] = useState({
    upiId: '', businessName: 'Next Lane Self Drives', phone: '+91 98765 43210',
    weekendMultiplier: 1.3,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminAPI.getPaymentSettings().then(({ data }) => {
      if (data.qrImage) setQrPreview(data.qrImage)
      if (data.settings) setSettings(s => ({ ...s, ...data.settings }))
    }).catch(() => {})
  }, [])

  const handleQrChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setQrFile(file)
    const reader = new FileReader()
    reader.onload = () => setQrPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSaveQr = async () => {
    if (!qrFile) { toast.error('Please select a QR image first'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('qr', qrFile)
      await adminAPI.uploadQR(fd)
      toast.success('QR code updated!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await adminAPI.updateSettings(settings)
      toast.success('Settings saved!')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('data:')) return url
    const baseUrl = import.meta.env.VITE_API_URL || ''
    return baseUrl.replace(/\/$/, '') + url
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-white text-4xl tracking-widest mb-1">SETTINGS</h1>
        <p className="text-white/30 font-mono text-sm">Manage your business settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* GPay QR */}
        <div className="glass-card p-6">
          <h2 className="font-heading font-bold text-white text-lg mb-1">Google Pay QR Code</h2>
          <p className="text-white/30 text-sm font-body mb-6">This QR is shown to customers during checkout</p>

          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 glass rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/10 hover:border-brand-500/40 transition-colors">
              {qrPreview ? (
                <img src={getImageUrl(qrPreview)} alt="GPay QR" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-white/30 text-xs">No QR uploaded</p>
                </div>
              )}
            </div>

            <label className="btn-ghost cursor-pointer flex items-center gap-2 text-sm">
              <FiUpload size={14} />
              {qrPreview ? 'Change QR Image' : 'Upload QR Image'}
              <input type="file" accept="image/*" onChange={handleQrChange} className="hidden" />
            </label>

            <button onClick={handleSaveQr} disabled={!qrFile || saving}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
              <FiSave size={14} /> {saving ? 'Saving...' : 'Save QR Code'}
            </button>
          </div>

          <div className="mt-4">
            <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">UPI ID</label>
            <input value={settings.upiId} onChange={e => setSettings({ ...settings, upiId: e.target.value })}
              placeholder="yourname@upi" className="input-field" />
          </div>
        </div>

        {/* Business Settings */}
        <div className="glass-card p-6">
          <h2 className="font-heading font-bold text-white text-lg mb-1">Business Settings</h2>
          <p className="text-white/30 text-sm font-body mb-6">Update your business information</p>

          <div className="space-y-4">
            {[
              { key: 'businessName', label: 'Business Name' },
              { key: 'phone', label: 'Contact Phone' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">{f.label}</label>
                <input value={settings[f.key]} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                  className="input-field" />
              </div>
            ))}

            <div>
              <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">
                Weekend Price Multiplier: {settings.weekendMultiplier}x
              </label>
              <input type="range" min={1} max={2} step={0.05}
                value={settings.weekendMultiplier}
                onChange={e => setSettings({ ...settings, weekendMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-brand-500" />
              <div className="flex justify-between text-white/20 text-xs font-mono mt-1">
                <span>1x (no markup)</span>
                <span>2x (double)</span>
              </div>
            </div>
          </div>

          <button onClick={handleSaveSettings} disabled={saving}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50">
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Quick links */}
        <div className="glass-card p-6">
          <h2 className="font-heading font-bold text-white text-lg mb-4">Quick Links</h2>
          <div className="space-y-3">
            {[
              { label: '📸 Instagram', href: 'https://www.instagram.com/next_lane_self_drives' },
              { label: '💬 WhatsApp Business', href: 'https://wa.me/919876543210' },
              { label: '🗺️ Google My Business', href: 'https://business.google.com' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 glass rounded-xl text-white/60 hover:text-white hover:border-brand-500/30 transition-all text-sm font-body">
                {l.label}
                <span className="text-xs text-white/20">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
