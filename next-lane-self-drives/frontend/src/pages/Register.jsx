import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../hooks/useStore'
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
    if (result.success) { toast.success('Account created! 🎉'); navigate('/') }
    else toast.error(result.message)
  }

  const fields = [
    { key: 'name', label: 'Full Name', icon: <FiUser />, type: 'text', placeholder: 'Your full name' },
    { key: 'email', label: 'Email', icon: <FiMail />, type: 'email', placeholder: 'your@email.com' },
    { key: 'phone', label: 'Phone', icon: <FiPhone />, type: 'tel', placeholder: '+91 98765 43210' },
  ]

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 relative">
      <div className="orb orb-orange w-80 h-80 top-0 left-0 opacity-20" />
      <div className="orb orb-purple w-60 h-60 bottom-0 right-0 opacity-15" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-display text-lg">NL</span>
            </div>
          </Link>
          <h1 className="font-display text-white text-5xl tracking-widest mb-2">JOIN US</h1>
          <p className="text-white/40 font-body">Create your account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{f.icon}</span>
                  <input type={f.type} required value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className="input-field pl-11" />
                </div>
              </div>
            ))}

            {['password', 'confirm'].map((key, i) => (
              <div key={key}>
                <label className="text-white/50 text-xs font-mono uppercase tracking-widest block mb-2">
                  {i === 0 ? 'Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input type={showPwd ? 'text' : 'password'} required value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder="••••••••" className="input-field pl-11 pr-11" />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm font-body mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-heading">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
