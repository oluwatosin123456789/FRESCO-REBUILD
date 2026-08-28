// Set the demo account passwords in Supabase Auth.
// Usage: node scripts/set-demo-password.mjs [password]
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const PASSWORD = process.argv[2] || '12345678'
const emails = ['amaka@fresco.demo', 'david@fresco.demo', 'wema@fresco.demo']

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (error) {
  console.error('Failed to list users:', error.message)
  process.exit(1)
}

for (const email of emails) {
  const user = data.users.find((u) => u.email === email)
  if (!user) {
    console.log(`NOT FOUND: ${email}`)
    continue
  }
  const { error: upErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: PASSWORD,
  })
  console.log(upErr ? `FAILED ${email}: ${upErr.message}` : `UPDATED ${email} -> ${PASSWORD}`)
}