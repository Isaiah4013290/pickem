import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getParlayMultiplier } from '@/lib/parlay'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { wager, legs } = await req.json()

  const wagerAmount = parseInt(String(wager), 10)
  if (!wagerAmount || wagerAmount <= 0) {
    return NextResponse.json({ error: 'Invalid wager' }, { status: 400 })
  }

  if (!Array.isArray(legs) || legs.length < 2 || legs.length > 6) {
    return NextResponse.json({ error: 'Parlay must have 2 to 6 legs' }, { status: 400 })
  }

  const questionIds = legs.map((l: any) => l.questionId)
  if (new Set(questionIds).size !== legs.length) {
    return NextResponse.json({ error: 'Duplicate questions not allowed' }, { status: 400 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('coins')
    .eq('id', user.id)
    .single()

  if (!userData || userData.coins < wagerAmount) {
    return NextResponse.json({ error: 'Not enough coins' }, { status: 400 })
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('id, closes_at, status')
    .in('id', questionIds)

  if (!questions || questions.length !== questionIds.length) {
    return NextResponse.json({ error: 'One or more questions not found' }, { status: 400 })
  }

  const now = new Date()
  for (const q of questions) {
    if (q.status !== 'open' || new Date(q.closes_at) <= now) {
      return NextResponse.json({ error: 'One or more questions are closed' }, { status: 400 })
    }
  }

  const multiplier = getParlayMultiplier(legs.length)

  const { data: parlay, error: parlayError } = await supabase
    .from('parlays')
    .insert({
      user_id: user.id,
      wager: wagerAmount,
      legs_count: legs.length,
      multiplier,
      status: 'pending',
    })
    .select('id')
    .single()

  if (parlayError || !parlay) {
    return NextResponse.json({ error: 'Failed to create parlay' }, { status: 500 })
  }

  await supabase.from('parlay_legs').insert(
    legs.map((l: any) => ({
      parlay_id: parlay.id,
      question_id: l.questionId,
      pick: l.pick,
    }))
  )

  await supabase
    .from('users')
    .update({ coins: userData.coins - wagerAmount })
    .eq('id', user.id)

  await supabase.from('coin_transactions').insert({
    user_id: user.id,
    amount: -wagerAmount,
    reason: `Parlay placed (${legs.length} legs)`,
  })

  return NextResponse.json({ success: true, parlayId: parlay.id })
}
