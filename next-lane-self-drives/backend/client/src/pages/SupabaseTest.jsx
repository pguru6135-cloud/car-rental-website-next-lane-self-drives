import React, { useState, useEffect } from 'react'
import { createClient } from '../utils/supabase/client'

export default function SupabaseTest() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        // Replace 'todos' with any table you have, or just check the connection
        const { data: todos, error } = await supabase.from('cars').select('count', { count: 'exact' })
        
        if (error) throw error
        setData(todos)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8 mt-20 text-white bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>
      
      {loading && <p className="animate-pulse">Loading connection...</p>}
      
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded text-red-100">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="p-4 bg-green-900/50 border border-green-500 rounded text-green-100">
          <p className="font-bold">✅ Success!</p>
          <p>Connected to Supabase project.</p>
          <p className="mt-2 text-sm opacity-70">
            Note: If you haven't created a 'cars' table in Supabase yet, you might see an empty result or a 'table not found' error.
          </p>
        </div>
      )}

      <div className="mt-8 p-4 border border-white/10 rounded">
        <h2 className="text-xl font-semibold mb-2">Supabase Credentials</h2>
        <p className="text-sm opacity-50">URL: {import.meta.env.VITE_SUPABASE_URL}</p>
      </div>
    </div>
  )
}
