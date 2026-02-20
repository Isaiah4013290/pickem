import { supabase } from '@/lib/supabase'

export async function settleParlaysForQuestion(questionId: string) {
  const { data: touchedLegs } = await supabase
    .from('parlay_legs')
    .select('parlay_id')
    .eq('question_id', questionId)

  const parlayIds = [...new Set((touchedLegs ?? []).map((l: any) => l.parlay_id))]
  if (parlayIds.length === 0) return

  const { data: parlays } = await supabase
    .from('parlays')
    .select('id, user_id, wager, multiplier, status')
    .in('id', parlayIds)
    .eq('status', 'pending')

  for (const parlay of parlays ?? []) {
    const { data: legs } = await supabase
      .from('parlay_legs')
      .select('is_correct')
      .eq('parlay_id', parlay.id)

    if (!legs || legs.length === 0) continue

    const hasLoss = legs.some((l: any) => l.is_correct === false)
    const allWon = legs.every((l: any) => l.is_correct === true)

    if (hasLoss) {
      await supabase
        .from('parlays')
        .update({ status: 'lost', payout: 0, settled_at: new Date().toISOString() })
        .eq('id', parlay.id)

      await supabase.from('coin_transactions').insert({
        user_id: parlay.user_id,
        amount: 0,
        reason: `Parlay lost (${parlay.multiplier}x)`,
      })
      continue
    }

    if (allWon) {
      const grossPayout = Math.min(500, Math.floor(parlay.wager * Number(parlay.multiplier)))

      await supabase
        .from('parlays')
        .update({ status: 'won', payout: grossPayout, settled_at: new Date().toISOString() })
        .eq('id', parlay.id)

      const { data: u } = await supabase
        .from('users')
        .select('coins')
        .eq('id', parlay.user_id)
        .single()

      if (u) {
        await supabase
          .from('users')
          .update({ coins: u.coins + grossPayout })
          .eq('id', parlay.user_id)

        await supabase.from('coin_transactions').insert({
          user_id: parlay.user_id,
          amount: grossPayout,
          reason: `Parlay won (${parlay.multiplier}x)`,
        })
      }
    }
  }
}
