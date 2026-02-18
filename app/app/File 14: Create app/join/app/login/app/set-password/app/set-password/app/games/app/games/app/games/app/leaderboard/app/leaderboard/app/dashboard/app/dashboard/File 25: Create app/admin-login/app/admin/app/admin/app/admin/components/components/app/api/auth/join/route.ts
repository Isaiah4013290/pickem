import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { username } = await req.json()

  if (!username || !/^[a-zA-Z0-9_]{2,20}$/.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 2–20 characters: letters, numbers, underscores only.' },
      { status: 400 }
    )
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id, status')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (existing) {
    if (existing.status === 'pending') {
      return NextResponse.json({ error: 'That username is already pending approval.' }, { status: 409 })
    }
    if (existing.status === 'approved') {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }
    if (existing.status === 'denied') {
      return NextResponse.json({ error: 'That username was denied. Try a different one.' }, { status: 409 })
    }
  }

  const { error } = await supabase.from('users').insert({
    username: username.toLowerCase(),
    status: 'pending',
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit request.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
