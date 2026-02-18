import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { gameId, pick, wager } = await req.json()

  const { data: game } = await supabase
    .from('games')
    .select('game_time, status')
    .eq('id', gameId)
    .single()

  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (new Date(game.game_time) <= new Date()) {
    return NextResponse.json({ error: 'Picks are locked for this game' }, { status: 400 })
  }
  if (game.status !== 'upcoming') {
    return NextResponse.json({ error: 'Game is not open for picks' }, { status: 400 })
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
    .eq('game_id', gameId)
    .maybeSingle()

  const previousWager = existingPick?.wager ?? 0
  const coinDiff = wagerAmount - previousWager

  if ((userData?.coins ?? 0) < coinDiff) {
    return NextResponse.json({ error: 'Not enough coins for this wager' }, { status: 400 })
  }

  const { error } = await supabase
    .from('picks')
    .upsert(
      { user_id: user.id, game_id: gameId, pick, wager: wagerAmount },
      { onConflict: 'user_id,game_id' }
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
