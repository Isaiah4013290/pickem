import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sport_id, home_team, away_team, game_date, game_time, location } = await req.json()

  const fullDateTime = new Date(`${game_date}T${game_time}`).toISOString()

  const { error } = await supabase.from('games').insert({
    sport_id,
    home_team,
    away_team,
    game_date,
    game_time: fullDateTime,
    location: location || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { gameId, homeScore, awayScore } = await req.json()

  let winner: 'home' | 'away' | 'tie'
  if (homeScore > awayScore) winner = 'home'
  else if (awayScore > homeScore) winner = 'away'
  else winner = 'tie'

  const { error } = await supabase
    .from('games')
    .update({ status: 'final', home_score: homeScore, away_score: awayScore, winner })
    .eq('id', gameId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
