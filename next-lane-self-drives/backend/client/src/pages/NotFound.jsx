import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="font-display text-brand-500 text-9xl mb-4" style={{ textShadow: '0 0 60px rgba(249,115,22,0.4)' }}>404</div>
        <h1 className="font-heading font-bold text-white text-3xl mb-3">Page not found</h1>
        <p className="text-white/40 font-body mb-8">Looks like you took a wrong turn.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">← Back to Home</Link>
      </motion.div>
    </main>
  )
}
