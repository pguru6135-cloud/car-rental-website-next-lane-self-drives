import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'
import axios from 'axios'

const QUICK_REPLIES = [
  'How do I book a car?',
  'What documents do I need?',
  'What is the cancellation policy?',
  'Do you offer pickup/drop?',
  'Weekend pricing?',
]

const BOT_RESPONSES = {
  'how do i book': 'Booking is easy! Browse our cars, pick your dates, and click "Book Now". You\'ll need to create an account first. 🚗',
  'documents': 'You\'ll need: Valid Driving Licence (DL), Aadhaar Card / Passport, and a security deposit. All docs can be uploaded during booking.',
  'cancel': 'You can cancel up to 24 hours before pickup for a full refund. Cancellations within 24 hours receive a 50% refund.',
  'pickup': 'Yes! We offer free pickup and drop within Tirupur city limits. For outstation, a small fee applies.',
  'weekend': 'Weekend rates (Sat-Sun) are 30% higher than weekday rates. Our system calculates this automatically when you select dates.',
  'price': 'Our prices start from ₹1,200/day for hatchbacks, ₹1,800/day for sedans, and ₹2,500/day for SUVs.',
  'contact': 'Call us: +91 9342179459 or email pguru6135@gmail.com. We\'re available 8 AM – 9 PM daily.',
  'hello': 'Hey there! 👋 I\'m your Next Lane assistant. How can I help you today?',
  'hi': 'Hi! Welcome to Next Lane Self Drives. Need help finding the perfect car? 🚀',
}

function getBotReply(msg) {
  const lower = msg.toLowerCase()
  for (const [key, reply] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return reply
  }
  return "I'd be happy to help! For specific queries, please call us at +91 9342179459 or check our Contact page. 😊"
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hi! 👋 I\'m the Next Lane assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), from: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)

    try {
      const lower = text.toLowerCase()
      // Detect if user is asking for car suggestions
      if (lower.includes('suggest') || lower.includes('recommend') || lower.includes('looking for') || lower.includes('car')) {
        let carType = null
        if (lower.includes('suv')) carType = 'SUV'
        if (lower.includes('sedan')) carType = 'Sedan'
        if (lower.includes('hatchback')) carType = 'Hatchback'

        let budget = null
        const budgetMatch = lower.match(/(?:under|budget|₹|rs\.?)\s*(\d+,?\d*)/)
        if (budgetMatch) budget = parseInt(budgetMatch[1].replace(',', ''))

        const pythonApiUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'
        const res = await axios.post(`${pythonApiUrl}/suggestions`, {
          location: 'Tirupur', car_type: carType, budget, days: 1
        })
        
        if (res.data?.suggestions?.length > 0) {
          const cars = res.data.suggestions.map(c => `• ${c.name} (${c.type}): ₹${c.pricePerDay}/day\n  ${c.reason}`).join('\n\n')
          setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: `Here are some great options for you:\n\n${cars}` }])
        } else {
          setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: "I couldn't find exact matches for that budget/type. Try adjusting your criteria!" }])
        }
      } else {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
        setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: getBotReply(text) }])
      }
    } catch (err) {
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: getBotReply(text) }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="mb-4 w-80 glass rounded-2xl overflow-hidden shadow-2xl"
            style={{ maxHeight: 480 }}
          >
            {/* Header */}
            <div className="bg-brand-500/10 border-b border-brand-500/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg shadow-brand-500/20">🚗</div>
                <div>
                  <div className="text-main font-heading font-semibold text-sm">Next Lane Bot</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-[10px] font-mono uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-brand-500 transition-colors">
                <FiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: 280 }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.from === 'user'
                      ? 'bg-brand-500 text-white rounded-br-none'
                      : 'bg-white/5 dark:bg-white/10 text-main rounded-bl-none border border-brand-500/10'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-xl rounded-bl-none">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="px-3 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
              {QUICK_REPLIES.slice(0, 3).map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-[10px] uppercase tracking-wider font-heading border border-brand-500/20 text-brand-500 px-3 py-1.5 rounded-full hover:bg-brand-500 hover:text-white transition-all whitespace-nowrap shadow-sm">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-brand-500/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 dark:bg-white/10 border border-brand-500/10 rounded-xl px-4 py-2 text-main text-sm placeholder-muted outline-none focus:border-brand-500 transition-colors shadow-inner"
              />
              <button onClick={() => sendMessage(input)}
                className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex-shrink-0">
                <FiSend size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX size={22} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <FiMessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
