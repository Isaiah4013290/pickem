'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CommentSection } from './CommentSection'
import { ParlayLeg } from './ParlayTray'

interface Props {
  question: any
  userPick: any
  userCoins: number
  parlayLegs: ParlayLeg[]
  onAddToParlay: (leg: ParlayLeg) => void
  onRemoveFromParlay: (questionId: string) => void
}

export function PickCard({ question, userPick, userCoins, parlayLegs, onAddToParlay, onRemoveFromParlay }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedPick, setSelectedPick] = useState<'yes' | 'no' | null>(userPick?.pick ?? null)
  const [wager, setWager] = useState<number>(userPick?.wager ?? 0)
  const [error, setError] = useState('')
  const [parlayPick, setParlayPick] = useState<'yes' | 'no' | null>(null)
  const locked = new Date(question.closes_at) <= new Date()
  const isOpen = question.status === 'open' && !locked
  const inParlay = parlayLegs.find(l => l.questionId === question.id)

  const submitPick = (pick: 'yes' | 'no', wagerAmount: number) => {
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, pick, wager: wagerAmount }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else router.refresh()
    })
  }

  const handlePick = (pick: 'yes' | 'no') => {
    if (locked) return
    setSelectedPick(pick)
    submitPick(pick, wager)
  }

  const handleWagerSubmit = () => {
    if (!selectedPick) { setError('Pick Yes or No first'); return }
    submitPick(selectedPick, wager)
  }

  const handleParlayPick = (pick: 'yes' | 'no') => {
    setParlayPick(pick)
    onAddToParlay({ questionId: question.id, question: question.question, pick })
  }

  return (
    <div className="card p-6">
      {/* Question */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <p className="font-syne font-bold text-lg leading-snug">{question.question}</p>
        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
          question.status === 'graded' ? 'bg-slate-800 text-slate-400' :
          locked ? 'bg-red-900/40 text-red-400' :
          'bg-green-900/40 text-green-400'
        }`}>
          {question.status === 'graded' ? 'Graded' : locked ? 'Closed' : 'Open'}
        </span>
      </div>

      {isOpen && (
        <p className="text-xs text-slate-500 mb-4">
          🔓 Closes {new Date(question.closes_at).toLocaleString()}
        </p>
      )}

      {/* Single pick */}
      {isOpen ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handlePick('yes')} disabled={isPending}
              className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                selectedPick === 'yes'
                  ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-900/30'
                  : 'bg-green-900/20 border-green-800/50 text-green-400 hover:bg-green-900/40'
              }`}>
              {selectedPick === 'yes' ? '✓ ' : ''}YES
            </button>
            <button onClick={() => handlePick('no')} disabled={isPending}
              className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                selectedPick === 'no'
                  ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-900/30'
                  : 'bg-red-900/20 border-red-800/50 text-red-400 hover:bg-red-900/40'
              }`}>
              {selectedPick === 'no' ? '✓ ' : ''}NO
            </button>
          </div>

          {selectedPick && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-xs text-slate-500">Wager</span>
                <input type="number" min={0} max={userCoins + (userPick?.wager ?? 0)} value={wager}
                  onChange={e => setWager(Math.min(parseInt(e.target.value) || 0, userCoins + (userPick?.wager ?? 0)))}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-amber-500" />
                <span className="text-xs text-slate-500">🪙 = win {wager * 2}🪙</span>
              </div>
              <button onClick={handleWagerSubmit} disabled={isPending} className="btn-primary text-xs px-3 py-1.5">
                {isPending ? '...' : 'Confirm'}
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          {/* Parlay section */}
          <div className="border-t border-slate-800 pt-3 mt-2">
            <p className="text-xs text-slate-500 mb-2">➕ Add to Parlay</p>
            {inParlay ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400">
                  Added as <strong>{inParlay.pick.toUpperCase()}</strong>
                </span>
                <button onClick={() => { onRemoveFromParlay(question.id); setParlayPick(null) }}
                  className="text-xs text-slate-600 hover:text-red-400">Remove</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleParlayPick('yes')}
                  className="py-1.5 rounded-lg font-bold text-xs border border-green-800/50 text-green-400 hover:bg-green-900/30 transition-colors">
                  YES (parlay)
                </button>
                <button onClick={() => handleParlayPick('no')}
                  className="py-1.5 rounded-lg font-bold text-xs border border-red-800/50 text-red-400 hover:bg-red-900/30 transition-colors">
                  NO (parlay)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : userPick ? (
        <div className={`rounded-xl px-4 py-3 text-sm text-center ${
          userPick.is_correct === true ? 'bg-green-900/30 border border-green-800/50 text-green-300' :
          userPick.is_correct === false ? 'bg-red-900/30 border border-red-800/50 text-red-300' :
          'bg-slate-800/60 text-slate-400'
        }`}>
          {userPick.is_correct === true && '✅ '}
          {userPick.is_correct === false && '❌ '}
          You picked <strong>{userPick.pick.toUpperCase()}</strong>
          {userPick.wager > 0 && <span className="ml-2 opacity-70">· {userPick.wager}🪙 wagered</span>}
          {userPick.payout != null && (
            <span className={`ml-2 font-bold ${userPick.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {userPick.payout > 0 ? `+${userPick.payout}` : userPick.payout}🪙
            </span>
          )}
          {question.status === 'graded' && question.correct_answer && (
            <p className="text-xs mt-1 opacity-60">Correct answer: {question.correct_answer.toUpperCase()}</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl px-4 py-3 text-sm text-center bg-slate-800/40 text-slate-600">
          {question.status === 'graded' ? `Answer: ${question.correct_answer?.toUpperCase()} · No pick made` : 'Closed — no pick made'}
        </div>
      )}

      <CommentSection questionId={question.id} userPick={userPick?.pick} />
    </div>
  )
}
