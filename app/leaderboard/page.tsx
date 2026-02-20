import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { data: users } = await supabase
    .from('users')
    .select('id, username, coins')
    .eq('status', 'approved')
    .eq('is_admin', false)
    .order('coins', { ascending: false })
    .limit(50)

  const myRank = users?.findIndex(e => e.id === user.id) ?? -1

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold">Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-1">Top 50 ranked by coins</p>
      </div>

      {myRank >= 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <span className="text-amber-300 text-sm font-medium">Your rank</span>
          <div className="text-right">
            <span className="font-syne font-bold text-2xl text-amber-400">#{myRank + 1}</span>
            <span className="text-amber-500 text-sm ml-2">{users?.[myRank]?.coins ?? 0} 🪙</span>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs text-slate-600 border-b border-slate-800 font-medium uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-7">Player</div>
          <div className="col-span-4 text-right">Coins 🪙</div>
        </div>

        {(users ?? []).length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No players yet!</div>
        ) : (
          users!.map((entry, i) => {
            const isMe = entry.id === user.id
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={entry.id} className={`grid grid-cols-12 gap-2 px-5 py-4 border-b border-slate-800/40 ${isMe ? 'bg-amber-500/5' : 'hover:bg-slate-800/20'}`}>
                <div className="col-span-1 text-slate-500 text-sm flex items-center">
                  {i < 3 ? medals[i] : i + 1}
                </div>
                <div className="col-span-7 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                    {entry.username[0].toUpperCase()}
                  </div>
                  <span className={`font-medium text-sm truncate ${isMe ? 'text-amber-300' : ''}`}>
                    {entry.username}
                    {isMe && <span className="text-xs ml-1 text-amber-600">you</span>}
                  </span>
                </div>
                <div className="col-span-4 text-right font-syne font-bold text-amber-400">
                  {entry.coins}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
