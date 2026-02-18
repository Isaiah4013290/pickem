import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST() {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.rpc('award_weekly_coins')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
