import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSession, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json()

    // 1. Basic check: is the password long enough?
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    // 2. Check if the user exists and is actually approved
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, status')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    if (user.status !== 'approved') {
      return NextResponse.json({ error: 'This account is not approved yet.' }, { status: 403 })
    }

    // 3. Scramble the password for security
    const hash = await hashPassword(password)

    // 4. Update the user record in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password in database.' }, { status: 500 })
    }

    // 5. Success! Log them in automatically by creating a session
    await createSession(userId)

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: 'Server error occurred.' }, { status: 500 })
  }
}
