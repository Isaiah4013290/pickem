import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { data: picks } = await supabase
    .from('picks')
    .select('*, games(*, sports(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: transactions } = await supabase
    .from('coin_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const graded = picks?.filter(p => p.is_correct !== null) ?? []
  const correct = graded.filter(p => p.is_correct === true).length
  const total = graded.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  let streak = 0
  const sorted = [...graded].sort((a, b) =>
    new Date((b.games as any)?.game_time ?? 0).getTime() - new Date((a.games as any)?.game_time ?? 0).getTime()
  )
  for (const p of sorted) {
    if (p.is_correct) streak++
    else break
  }

  const { data: lb } = await supabase.from('leaderboard').select('id')
  const rank = (lb?.findIndex(e => e.id === user.id) ?? -1) + 1

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold">
          Hey, <span className="text-amber-400">{user.username}</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Coins', value: `${user.coins} 🪙`, color: 'text-amber-400' },
          { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 60 ? 'text-green-400' : 'text-slate-200' },
          { label: 'Streak', value: streak > 0 ? `${streak} 🔥` : '0', color: streak > 2 ? 'text-orange-400' : 'text-slate-200' },
          { label: 'Rank', value: rank > 0 ? `#${rank}` : '—', color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`font-syne text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-syne text-xl font-bold mb-4">Pick History</h2>
          {(picks ?? []).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm card">No picks yet</div>
          ) : (
            <div className="space-y-2">
              {picks!.map(pick => {
                const game = pick.games as any
                const pickedTeam = pick.pick === 'home' ? game?.home_team : game?.away_team
                return (
                  <div key={pick.id} className={`card p-4 flex items-center justify-between gap-3 ${
                    pick.is_correct === true ? 'border-green-900/40' :
                    pick.is_correct === false ? 'border-red-900/40' : ''
                  }`}>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">{game?.sports?.emoji} {formatDate(game?.game_date)}</p>
                      <p className="text-sm font-medium truncate">{game?.away_team} vs {game?.home_team}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pick: <span className="text-slate-200">{pickedTeam}</span>
                        {pick.wager > 0 && <span className="ml-2 text-amber-500">{pick.wager}🪙</span>}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {pick.is_correct === true && <div>
                        <span className="text-green-400">✅</span>
                        {pick.payout != null && <p className="text-xs text-green-400">+{pick.payout}🪙</p>}
                      </div>}
                      {pick.is_correct === false && <div>
                        <span className="text-red-400">❌</span>
                        {pick.payout != null && <p className="text-xs text-red-400">{pick.payout}🪙</p>}
                      </div>}
                      {pick.is_correct === null && <span className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded-full">Pending</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-syne text-xl font-bold mb-4">Coin History</h2>
          {(transactions ?? []).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm card">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {transactions!.map(tx => (
                <div key={tx.id} className="card p-4 flex items-center justify-between">
                  <p className="text-sm text-slate-300 truncate">{tx.reason}</p>
                  <span className={`font-bold text-sm flex-shrink-0 ml-3 ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}🪙
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
