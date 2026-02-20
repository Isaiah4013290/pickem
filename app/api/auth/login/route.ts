import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSession, verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, username, password_hash, status, is_admin, coins, first_login_bonus_given')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: 'Database error.' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Username not found.' }, { status: 404 })
    }

    if (user.status === 'pending') {
      return NextResponse.json({ error: 'Your account is still pending approval.' }, { status: 403 })
    }

    if (user.status === 'denied') {
      return NextResponse.json({ error: 'Your account request was denied.' }, { status: 403 })
    }

    if (!user.password_hash) {
      return NextResponse.json({
        needsPassword: true,
        user: user.id
      }, { status: 200 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    if (!user.first_login_bonus_given) {
      await supabase
        .from('users')
        .update({ coins: user.coins + 15, first_login_bonus_given: true })
        .eq('id', user.id)

      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        amount: 15,
        reason: 'First login bonus!',
      })
    }

    await createSession(user.id)
    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
