import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore, useThemeStore } from './hooks/useStore'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatBot from './components/ChatBot'

// Pages
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetails from './pages/CarDetails'
import Booking from './pages/Booking'
import BookingConfirm from './pages/BookingConfirm'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PaymentVerification from './pages/PaymentVerification'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminCars from './pages/admin/AdminCars'
import AdminBookings from './pages/admin/AdminBookings'
import AdminSettings from './pages/admin/AdminSettings'
import AdminWhatsApp from './pages/admin/AdminWhatsApp'
import NotFound from './pages/NotFound'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public routes with Navbar + Footer */}
        <Route path="/" element={<><Navbar /><Home /><Footer /><ChatBot /></>} />
        <Route path="/cars" element={<><Navbar /><Cars /><Footer /><ChatBot /></>} />
        <Route path="/cars/:id" element={<><Navbar /><CarDetails /><Footer /><ChatBot /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />

        {/* Protected user routes */}
        <Route path="/booking/:id" element={
          <PrivateRoute><Navbar /><Booking /><Footer /></PrivateRoute>
        } />
        <Route path="/booking/payment/:id" element={
          <PrivateRoute><Navbar /><PaymentVerification /><Footer /></PrivateRoute>
        } />
        <Route path="/booking/confirm/:id" element={
          <PrivateRoute><Navbar /><BookingConfirm /><Footer /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Navbar /><Dashboard /><Footer /></PrivateRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="cars" element={<AdminCars />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="whatsapp" element={<AdminWhatsApp />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
