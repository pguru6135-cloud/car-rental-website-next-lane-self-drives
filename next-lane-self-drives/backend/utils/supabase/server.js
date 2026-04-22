const { createServerClient } = require("@supabase/ssr")

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

/**
 * Creates a Supabase client for use in Express routes.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const createClient = (req, res) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name],
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookie(name, value, options)
          })
        },
      },
    },
  )
}

module.exports = { createClient }
