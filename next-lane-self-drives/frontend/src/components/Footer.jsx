import React from 'react'
import { Link } from 'react-router-dom'
import { FiInstagram, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative bg-dark-400 border-t border-white/5 overflow-hidden">
      {/* Bg orb */}
      <div className="orb orb-orange w-96 h-96 -bottom-48 left-1/2 -translate-x-1/2 opacity-20" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display text-lg">NL</span>
              </div>
              <div>
                <div className="font-display text-white text-xl tracking-widest">NEXT LANE</div>
                <div className="font-mono text-brand-400 text-[10px] tracking-[4px]">SELF DRIVES</div>
              </div>
            </div>
            <p className="text-white/50 font-body text-sm leading-relaxed max-w-xs">
              Premium self-drive car rentals in Tirupur. Experience the freedom of the road with our well-maintained fleet.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://www.instagram.com/next_lane_self_drives" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 glass rounded-lg flex items-center justify-center text-white/60 hover:text-brand-400 hover:border-brand-500/40 transition-all">
                <FiInstagram size={18} />
              </a>
              <a href="https://wa.me/919342179459" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 glass rounded-lg flex items-center justify-center text-white/60 hover:text-green-400 hover:border-green-500/40 transition-all">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 tracking-wider text-sm uppercase">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Browse Cars', path: '/cars' },
                { label: 'Book a Ride', path: '/cars' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'My Dashboard', path: '/dashboard' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/40 hover:text-brand-400 text-sm font-body transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 tracking-wider text-sm uppercase">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/40 text-sm">
                <FiPhone size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <span>+91 9342179459</span>
              </li>
              <li className="flex items-start gap-3 text-white/40 text-sm">
                <FiMail size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <span>pguru6135@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-white/40 text-sm">
                <FiMapPin size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <span>Tirupur, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-mono">
            © {new Date().getFullYear()} Next Lane Self Drives. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-white/20 text-xs font-mono">
            <span>Built with</span>
            <span className="text-brand-500">♥</span>
            <span>in Tirupur</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
