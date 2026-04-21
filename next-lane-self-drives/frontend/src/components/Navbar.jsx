import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiSettings } from 'react-icons/fi'
import { useAuthStore, useThemeStore } from '../hooks/useStore'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Cars', path: '/cars' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { user, logout, isAdmin, isAuthenticated } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenu(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-2xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-brand-500 rounded-lg rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-display text-lg">NL</span>
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-main text-xl tracking-widest uppercase">Next Lane</span>
            <span className="font-mono text-brand-400 text-[10px] tracking-[4px]">Self Drives</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-brand-500 after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === item.path ? 'text-brand-400 after:w-full' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/60 hover:text-brand-400 "
          >
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          {isAuthenticated() ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:border-brand-500/40 transition-colors"
              >
                <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-white text-sm font-heading hidden sm:block">{user?.name?.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 glass rounded-xl overflow-hidden shadow-2xl"
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="text-white font-heading font-semibold text-sm">{user?.name}</p>
                      <p className="text-white/40 text-xs mt-0.5 font-mono">{user?.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link to="/dashboard" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors">
                        <FiUser size={14} /> My Bookings
                      </Link>
                      {isAdmin() && (
                        <Link to="/admin" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-400 hover:bg-brand-500/10 text-sm transition-colors">
                          <FiSettings size={14} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost py-2 px-5 text-sm hidden sm:block">Login</Link>
              <Link to="/register" className="btn-primary py-2 px-5 text-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 glass rounded-lg flex items-center justify-center text-main"
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10"
            style={{ background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`block nav-link py-2 ${location.pathname === item.path ? 'text-brand-400' : ''}`}>
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated() && (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" className="btn-ghost py-2 px-4 text-sm flex-1 text-center">Login</Link>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm flex-1 text-center">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
