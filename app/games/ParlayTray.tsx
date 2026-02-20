'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getParlayMultiplier } from '@/lib/parlay'

export type ParlayLeg = {
  questionId: string
  question: string
  pick: 'yes' | 'no'
}

interface Props {
  legs: ParlayLeg[]
  userCoins: number
  onRemoveLeg: (questionId: string) => void
  onClear: () => void
}

export function ParlayTray({ legs, userCoins, onRemoveLeg, onClear }: Props) {
  const router = useRouter()
  const [wager, setWager] = useState(0)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  if (legs.length === 0) return null

  const multiplier = legs.length >= 2 && legs.length <= 6
    ? getParlayMultiplier(legs.length)
    : 0

  const projectedPayout = multiplier > 0 ? Math.min(500, Math.floor(wager * multiplier)) : 0
  const canSubmit = legs.length >= 2 && wager > 0 && wager <= userCoins && !loading

  const submitParlay = async () => {
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/parlays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wager, legs }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error)
      setLoading(false)
      return
    }
    setMsg('✅ Parlay placed!')
    setWager(0)
    onClear()
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-syne font-bold text-amber-400">
            Parlay Builder ({legs.length} leg{legs.length !== 1 ? 's' : ''})
          </h3>
          <button onClick={onClear} className="text-xs text-slate-500 hover:text-slate-300">
            Clear all
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          {legs.map(leg => (
            <div key={leg.questionId} className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <span className={`font-bold ${leg.pick === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                {leg.pick.toUpperCase()}
              </span>
              <span className="text-slate-400 truncate max-w-32">{leg.question}</span>
              <button onClick={() => onRemoveLeg(leg.questionId)} className="text-slate-600 hover:text-slate-300 ml-1">✕</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={userCoins}
              value={wager || ''}
              onChange={e => setWager(Math.min(parseInt(e.target.value) || 0, userCoins))}
              placeholder="Wager"
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs text-slate-500">🪙</span>
          </div>

          {multiplier > 0 && (
            <div className="text-xs text-slate-400">
              <span className="text-amber-400 font-bold">{multiplier}x</span>
              {wager > 0 && <span className="ml-2">→ win <span className="text-green-400 font-bold">{projectedPayout}🪙</span></span>}
            </div>
          )}

          {legs.length < 2 && (
            <span className="text-xs text-slate-600">Add {2 - legs.length} more leg{legs.length === 0 ? 's' : ''} to submit</span>
          )}

          <button
            onClick={submitParlay}
            disabled={!canSubmit}
            className={`btn-primary text-sm px-4 py-2 ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Placing...' : 'Place Parlay'}
          </button>

          {msg && <span className="text-xs text-slate-300">{msg}</span>}
        </div>
      </div>
    </div>
  )
}
