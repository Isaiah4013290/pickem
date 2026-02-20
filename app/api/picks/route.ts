import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { questionId, pick, wager } = await req.json()

  const { data: question } = await supabase
    .from('questions')
    .select('closes_at, status')
    .eq('id', questionId)
    .single()

  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  if (new Date(question.closes_at) <= new Date()) {
    return NextResponse.json({ error: 'This question is closed' }, { status: 400 })
  }
  if (question.status !== 'open') {
    return NextResponse.json({ error: 'This question is not open' }, { status: 400 })
  }

  const wagerAmount = parseInt(wager) || 0
  if (wagerAmount < 0) {
    return NextResponse.json({ error: 'Wager cannot be negative' }, { status: 400 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('coins')
    .eq('id', user.id)
    .single()

  const { data: existingPick } = await supabase
    .from('picks')
    .select('wager')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .maybeSingle()

  const previousWager = existingPick?.wager ?? 0
  const coinDiff = wagerAmount - previousWager

  if ((userData?.coins ?? 0) < coinDiff) {
    return NextResponse.json({ error: 'Not enough coins' }, { status: 400 })
  }

  const { error } = await supabase
    .from('picks')
    .upsert(
      { user_id: user.id, question_id: questionId, pick, wager: wagerAmount },
      { onConflict: 'user_id,question_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (coinDiff !== 0) {
    await supabase
      .from('users')
      .update({ coins: (userData?.coins ?? 0) - coinDiff })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
