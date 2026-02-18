'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatTime, isGameLocked, getStatusColor, getStatusLabel } from '@/lib/utils'

interface Props {
  game: any
  sport: any
  userPick: any
  userCoins: number
}

export function PickCard({ game, sport, userPick, userCoins }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedPick, setSelectedPick] = useState<'home' | 'away' | null>(userPick?.pick ?? null)
  const [wager, setWager] = useState<number>(userPick?.wager ?? 0)
  const [error, setError] = useState('')
  const locked = isGameLocked(game.game_time)

  const handlePick = (pick: 'home' | 'away') => {
    if (locked) return
    setSelectedPick(pick)
    submitPick(pick, wager)
  }

  const handleWagerChange = (val: number) => {
    const capped = Math.min(val, userCoins + (userPick?.wager ?? 0))
    setWager(capped)
  }

  const submitPick = (pick: 'home' | 'away', wagerAmount: number) => {
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, pick, wager: wagerAmount }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleWagerSubmit = () => {
    if (!selectedPick) {
      setError('Pick a team first')
      return
    }
    submitPick(selectedPick, wager)
  }

  return (
    <div className={`card p-5 transition-all ${locked ? 'opacity-75' : 'hover:border-slate-700'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span>{sport?.emoji}</span>
          <span>{sport?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${getStatusColor(game.status)}`}>
            {getStatusLabel(game.status)}
          </span>
          {!locked && (
            <span className="text-xs text-slate-600">🔓 {formatTime(game.game_time)}</span>
          )}
          {locked && game.status === 'upcoming' && (
            <span className="text-xs text-slate-600">🔒 Locked</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span className={`font-syne font-semibold ${game.winner === 'away' ? 'text-green-400' : ''}`}>
            {game.away_team}
            {game.winner === 'away' && <span className="text-xs ml-1.5 text-green-400">W</span>}
          </span>
          {game.status === 'final' && <span className="font-bold text-slate-300">{game.away_score}</span>}
        </div>
        <div className="text-xs text-slate-700 pl-1">vs</div>
        <div className="flex items-center justify-between">
          <span className={`font-syne font-semibold ${game.winner === 'home' ? 'text-green-400' : ''}`}>
            {game.home_team}
            {game.winner === 'home' && <span className="text-xs ml-1.5 text-green-400">W</span>}
          </span>
          {game.status === 'final' && <span className="font-bold text-slate-300">{game.home_score}</span>}
        </div>
      </div>

      {game.location && (
        <p className="text-xs text-slate-600 mb-3">📍 {game.location}</p>
      )}

      {!locked ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(['away', 'home'] as const).map(side => (
              <button
                key={side}
                onClick={() => handlePick(side)}
                disabled={isPending}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border truncate ${
                  selectedPick === side
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {selectedPick === side ? '✓ ' : ''}{side === 'away' ? game.away_team : game.home_team}
              </button>
            ))}
          </div>

          {selectedPick && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-xs text-slate-500">Wager</span>
                <input
                  type="number"
                  min={0}
                  max={userCoins + (userPick?.wager ?? 0)}
                  value={wager}
                  onChange={e => handleWagerChange(parseInt(e.target.value) || 0)}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-amber-500"
