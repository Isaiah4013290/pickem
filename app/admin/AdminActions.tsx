'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatTime } from '@/lib/utils'

interface Props {
  sports: any[]
  games: any[]
  pendingUsers: any[]
  allUsers: any[]
}

export function AdminActions({ sports, games, pendingUsers, allUsers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'users' | 'games' | 'create'>('users')
  const [msg, setMsg] = useState('')

  const flash = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 3000)
  }

  const approveUser = async (userId: string) => {
    startTransition(async () => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      })
      if (res.ok) { flash('✅ Approved!'); router.refresh() }
      else flash('❌ Error')
    })
  }

  const denyUser = async (userId: string) => {
    startTransition(async () => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'deny' }),
      })
      if (res.ok) { flash('Denied.'); router.refresh() }
      else flash('❌ Error')
    })
  }

  const enterScore = async (e: React.FormEvent<HTMLFormElement>, gameId: string) => {
    e.preventDefault()
    const form = e.currentTarget
    const homeScore = parseInt((form.elements.namedItem('home_score') as HTMLInputElement).value)
    const awayScore = parseInt((form.elements.namedItem('away_score') as HTMLInputElement).value)

    startTransition(async () => {
      const res = await fetch('/api/admin/games', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, homeScore, awayScore }),
      })
      if (res.ok) { flash('✅ Score saved!'); router.refresh() }
      else flash('❌ Error saving score')
    })
  }

  const createGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      sport_id: (form.elements.namedItem('sport_id') as HTMLSelectElement).value,
      away_team: (form.elements.namedItem('away_team') as HTMLInputElement).value,
      home_team: (form.elements.namedItem('home_team') as HTMLInputElement).value,
      game_date: (form.elements.namedItem('game_date') as HTMLInputElement).value,
      game_time: (form.elements.namedItem('game_time') as HTMLInputElement).value,
      location: (form.elements.namedItem('location') as HTMLInputElement).value,
    }

    startTransition(async () => {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) { flash('✅ Game created!'); form.reset(); router.refresh() }
      else flash('❌ Error creating game')
    })
  }

  const awardWeeklyCoins = async () => {
    startTransition(async () => {
      const res = await fetch('/api/admin/weekly-coins', { method: 'POST' })
      if (res.ok) { flash('✅ +15 coins awarded to all users!'); router.refresh() }
      else flash('❌ Error awarding coins')
    })
  }

  const tabs = [
    { key: 'users', label: `Users ${pendingUsers.length > 0 ? `(${pendingUsers.length} pending)` : ''}` },
    { key: 'games', label: 'Games' },
    { key: 'create', label: 'Create Game' },
  ] as const

  return (
    <div>
      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-slate-800 text-sm text-slate-200">{msg}</div>
      )}

      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`text-sm px-4 py-2 rounded-xl transition-colors ${
              activeTab === t.key ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={awardWeeklyCoins}
          disabled={isPending}
          className="ml-auto text-sm px-4 py-2 rounded-xl bg-green-900/40 border border-green-800/50 text-green-300 hover:bg-green-900/60 transition-colors"
        >
          +15 Weekly Coins 🪙
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          {pendingUsers.length > 0 && (
            <div>
              <h2 className="font-syne text-lg font-bold mb-3 text-amber-400">Pending Approval</h2>
              <div className="space-y-2">
                {pendingUsers.map(u => (
                  <div key={u.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">@{u.username}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Requested {new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveUser(u.id)} disabled={isPending}
                        className="btn-primary text-xs px-3 py-1.5">Approve</button>
                      <button onClick={() => denyUser(u.id)} disabled={isPending}
                        className="text-xs px-3 py-1.5 rounded-xl bg-red-900/40 border border-red-800/50 text-red-300 hover:bg-red-900/60 transition-colors">Deny</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-syne text-lg font-bold mb-3">All Users</h2>
            <div className="card overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2.5 text-xs text-slate-600 border-b border-slate-800 uppercase tracking-wider">
                <div className="col-span-4">Username</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-3 text-center">Coins</div>
                <div className="col-span-2 text-right">Joined</div>
              </div>
              {allUsers.map(u => (
                <div key={u.id} className="grid grid-cols-12 px-4 py-3 border-b border-slate-800/40 text-sm hover:bg-slate-800/20">
                  <div className="col-span-4 font-medium">@{u.username}</div>
                  <div className="col-span-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.status === 'approved' ? 'bg-green-900/40 text-green-400' :
                      u.status === 'pending' ? 'bg-amber-900/40 text-amber-400' :
                      'bg-red-900/40 text-red-400'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                  <div className="col-span-3 text-center text-amber-400">{u.coins}</div>
                  <div className="col-span-2 text-right text-slate-500">{new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'games' && (
        <div className="space-y-3">
          {games.map(game => (
            <div key={game.id} className="card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{game.sports?.emoji}</span>
                    <span className="text-xs text-slate-500">{formatDate(game.game_date)} · {formatTime(game.game_time)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      game.status === 'final' ? 'bg-slate-800 text-slate-400' :
                      game.status === 'live' ? 'bg-green-900/40 text-green-400' : 'bg-amber-900/30 text-amber-400'
                    }`}>{game.status}</span>
                  </div>
                  <p className="font-syne font-semibold">{game.away_team} <span className="text-slate-500">vs</span> {game.home_team}</p>
                  {game.status === 'final' && (
                    <p className="text-xs text-slate-500 mt-0.5">Final: {game.away_score}–{game.home_score} · Winner: {game.winner}</p>
                  )}
                </div>

                {game.status !== 'final' && (
                  <form onSubmit={(e) => enterScore(e, game.id)} className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Away</p>
                      <input name="away_score" type="number" min="0" required
                        className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:border-amber-500" placeholder="0" />
                    </div>
                    <span className="text-slate-600 mt-4">–</span>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Home</p>
                      <input name="home_score" type="number" min="0" required
                        className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:border-amber-500" placeholder="0" />
                    </div>
                    <div className="mt-4">
                      <button type="submit" disabled={isPending} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-md">
          <form onSubmit={createGame} className="card p-6 space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Sport</label>
              <select name="sport_id" required className="input-field">
                <option value="">Select sport...</option>
                {sports.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Away Team</label>
                <input name="away_team" type="text" required className="input-field" placeholder="Visitors" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Home Team</label>
                <input name="home_team" type="text" required className="input-field" placeholder="Home" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Date</label>
                <input name="game_date" type="date" required className="input-field" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Time</label>
                <input name="game_time" type="time" required className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Location (optional)</label>
              <input name="location" type="text" className="input-field" placeholder="Stadium name" />
            </div>
            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? 'Creating...' : 'Create Game'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
