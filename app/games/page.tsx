import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { formatDate, formatTime, isGameLocked, getStatusColor, getStatusLabel } from '@/lib/utils'
import { PickCard } from './PickCard'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ sport?: string }>
}

export default async function GamesPage({ searchParams }: Props) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const params = await searchParams

  const { data: sports } = await supabase.from('sports').select('*').order('name')

  let gamesQuery = supabase
    .from('games')
    .select('*, sports(*)')
    .order('game_time', { ascending: true })

  if (params.sport) {
    gamesQuery = gamesQuery.eq('sport_id', params.sport)
  }

  const { data: games } = await gamesQuery

  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('user_id', user.id)

  const picksByGame = new Map(picks?.map(p => [p.game_id, p]) ?? [])

  const gamesByDate = new Map<string, any[]>()
  for (const game of games ?? []) {
    if (!gamesByDate.has(game.game_date)) gamesByDate.set(game.game_date, [])
    gamesByDate.get(game.game_date)!.push(game)
  }
  const sortedDates = Array.from(gamesByDate.keys()).sort()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-syne text-3xl font-bold">Games</h1>
          <p className="text-slate-500 text-sm mt-1">
            You have <span className="text-amber-400 font-semibold">{user.coins} coins</span> to wager
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/games" className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!params.sport ? 'bg-amber-500 border-amber-400 text-slate-950 font-semibold' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
            All
          </a>
          {sports?.map(sport => (
            <a key={sport.id} href={`/games?sport=${sport.id}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${params.sport === sport.id ? 'bg-amber-500 border-amber-400 text-slate-950 font-semibold' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
              {sport.emoji} {sport.name}
            </a>
          ))}
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="text-lg font-syne">No games scheduled</p>
          <p className="text-sm mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedDates.map(date => (
            <section key={date}>
              <h2 className="font-syne text-base font-semibold text-amber-400 mb-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-800" />
                {formatDate(date)}
                <span className="h-px flex-1 bg-slate-800" />
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {gamesByDate.get(date)!.map(game => (
                  <PickCard
                    key={game.id}
                    game={game}
                    sport={(game as any).sports}
                    userPick={picksByGame.get(game.id) ?? null}
                    userCoins={user.coins}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
