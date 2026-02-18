import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, action } = await req.json()

  if (!['approve', 'deny'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const status = action === 'approve' ? 'approved' : 'denied'

  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'approved') {
    await supabase.from('users').update({ coins: 15 }).eq('id', userId)
    await supabase.from('coin_transactions').insert({
      user_id: userId,
      amount: 15,
      reason: 'Welcome bonus!',
    })
  }

  return NextResponse.json({ success: true })
}
