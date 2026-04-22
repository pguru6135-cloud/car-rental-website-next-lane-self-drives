import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGrid, FiTruck, FiBookOpen, FiSettings, FiLogOut, FiMenu, FiX, FiMessageCircle } from 'react-icons/fi'
import { useAuthStore } from '../../hooks/useStore'

const NAV = [
  { label: 'Overview', path: '/admin', icon: <FiGrid /> },
  { label: 'Cars', path: '/admin/cars', icon: <FiTruck /> },
  { label: 'Bookings', path: '/admin/bookings', icon: <FiBookOpen /> },
  { label: 'WhatsApp', path: '/admin/whatsapp', icon: <FiMessageCircle /> },
  { label: 'Settings', path: '/admin/settings', icon: <FiSettings /> },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-dark-400 border-r border-white/5 flex flex-col flex-shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display text-sm">NL</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-display text-white text-sm tracking-widest whitespace-nowrap">NEXT LANE</div>
              <div className="font-mono text-brand-400 text-[9px] tracking-[3px]">ADMIN</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-white/30 hover:text-white flex-shrink-0">
            {sidebarOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}>
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="font-heading font-semibold text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-heading font-semibold truncate">{user?.name}</p>
                <p className="text-white/30 text-[10px] font-mono">Admin</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
            <FiLogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-heading font-semibold text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-dark-300 p-8">
        <Outlet />
      </main>
    </div>
  )
}
