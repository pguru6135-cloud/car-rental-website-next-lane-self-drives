import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { adminAPI } from '../../utils/api'
import { formatCurrency } from '../../utils/pricing'

const DEMO_STATS = {
  totalCars: 15, availableCars: 11, totalBookings: 48, pendingBookings: 5,
  totalRevenue: 142600, todayBookings: 3,
  revenueByMonth: [
    { month: 'Oct', revenue: 18000 }, { month: 'Nov', revenue: 24000 },
    { month: 'Dec', revenue: 32000 }, { month: 'Jan', revenue: 28000 },
    { month: 'Feb', revenue: 22000 }, { month: 'Mar', revenue: 18600 },
  ],
  bookingsByType: [
    { name: 'SUV', value: 18 }, { name: 'Sedan', value: 16 },
    { name: 'Hatchback', value: 14 },
  ],
  recentBookings: [
    { _id: '1', car: { name: 'Hyundai Creta' }, user: { name: 'Karthik R' }, totalAmount: 5600, status: 'confirmed', pickupDate: new Date() },
    { _id: '2', car: { name: 'Swift Dzire' }, user: { name: 'Priya S' }, totalAmount: 3600, status: 'pending', pickupDate: new Date() },
    { _id: '3', car: { name: 'Baleno' }, user: { name: 'Ravi M' }, totalAmount: 2600, status: 'active', pickupDate: new Date() },
  ]
}

const PIE_COLORS = ['#f97316', '#6366f1', '#22d3ee']
const STATUS_COLORS = { pending: 'text-yellow-400', confirmed: 'text-green-400', active: 'text-brand-400', completed: 'text-white/40', cancelled: 'text-red-400' }

const TooltipStyle = { contentStyle: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontFamily: 'DM Sans' } }

export default function AdminOverview() {
  const [stats, setStats] = useState(DEMO_STATS)

  useEffect(() => {
    adminAPI.getStats().then(({ data }) => setStats(data)).catch(() => {})
  }, [])

  const CARDS = [
    { label: 'Total Cars', value: stats.totalCars, sub: `${stats.availableCars} available`, color: 'brand' },
    { label: 'Total Bookings', value: stats.totalBookings, sub: `${stats.pendingBookings} pending`, color: 'yellow' },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), sub: 'All time', color: 'green' },
    { label: 'Today', value: stats.todayBookings, sub: 'New bookings', color: 'purple' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-white text-4xl tracking-widest mb-1">DASHBOARD</h1>
        <p className="text-white/30 font-mono text-sm">Welcome back, Admin</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="glass-card p-5">
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">{c.label}</p>
            <div className="font-display text-white text-3xl tracking-wider mb-1">{c.value}</div>
            <p className="text-white/30 text-xs font-body">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-heading font-bold text-white mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.revenueByMonth}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TooltipStyle} formatter={v => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-bold text-white mb-4">Bookings by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.bookingsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={4}>
                {stats.bookingsByType.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {stats.bookingsByType.map((b, i) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-white/50">{b.name}</span>
                </div>
                <span className="text-white/70 font-mono">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="glass-card p-6">
        <h3 className="font-heading font-bold text-white mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          {stats.recentBookings.map((b) => (
            <div key={b._id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="w-9 h-9 bg-brand-500/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🚗</div>
              <div className="flex-1">
                <p className="text-white font-heading font-semibold text-sm">{b.car?.name}</p>
                <p className="text-white/30 text-xs">{b.user?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-brand-400 font-heading font-bold text-sm">{formatCurrency(b.totalAmount)}</p>
                <p className={`text-xs capitalize ${STATUS_COLORS[b.status] || 'text-white/40'}`}>{b.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
