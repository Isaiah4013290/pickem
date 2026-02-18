import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSession, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { userId, password } = await req.json()

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, status')
    .eq('id', userId)
    .maybeSingle()

  if (!user || user.status !== 'approved') {
    return NextResponse.json({ error: 'Invalid or unapproved user.' }, { status: 403 })
  }

  const hash = await hashPassword(password)

  await supabase
    .from('users')
    .update({ password_hash: hash })
    .eq('id', userId)

  await createSession(userId)

  return NextResponse.json({ success: true })
}
