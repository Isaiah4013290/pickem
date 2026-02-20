'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  questions: any[]
  pendingUsers: any[]
  allUsers: any[]
}

export function AdminActions({ questions, pendingUsers, allUsers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'create'>('questions')
  const [msg, setMsg] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [questionText, setQuestionText] = useState('')

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

  const createQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText || !closeDate || !closeTime) {
      flash('❌ Fill in all fields')
      return
    }
    const closes_at = new Date(`${closeDate}T${closeTime}`).toISOString()
    startTransition(async () => {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText, closes_at }),
      })
      if (res.ok) {
        flash('✅ Question created!')
        setQuestionText('')
        setCloseDate('')
        setCloseTime('')
        router.refresh()
      } else flash('❌ Error creating question')
    })
  }

  const setAnswer = async (questionId: string, answer: 'yes' | 'no') => {
    startTransition(async () => {
      const res = await fetch('/api/admin/games', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, correct_answer: answer }),
      })
      if (res.ok) { flash(`✅ Answer set to ${answer.toUpperCase()}!`); router.refresh() }
      else flash('❌ Error setting answer')
    })
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question? This cannot be undone.')) return
    startTransition(async () => {
      const res = await fetch('/api/admin/games', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      })
      if (res.ok) { flash('🗑️ Question deleted!'); router.refresh() }
      else flash('❌ Error deleting question')
    })
  }

  const tabs = [
    { key: 'questions', label: 'Questions' },
    { key: 'create', label: '+ Create' },
    { key: 'users', label: `Users${pendingUsers.length > 0 ? ` (${pendingUsers.length})` : ''}` },
  ] as const

  return (
    <div>
      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-slate-800 text-sm text-slate-200">{msg}</div>
      )}

      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`text-sm px-4 py-2 rounded-xl transition-colors ${
              activeTab === t.key ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Create Question */}
      {activeTab === 'create' && (
        <div className="max-w-lg">
          <form onSubmit={createQuestion} className="card p-6 space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Question</label>
              <textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm resize-none"
                placeholder="Will Highland Springs beat Freeman?"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Close Date</label>
                <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)}
                  className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Close Time</label>
                <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)}
                  className="input-field" required />
              </div>
            </div>
            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? 'Creating...' : 'Create Question'}
            </button>
          </form>
        </div>
      )}

      {/* Questions list */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-16 text-slate-500 card">No questions yet — create one!</div>
          ) : questions.map(q => (
            <div key={q.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="font-syne font-semibold">{q.question}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    q.status === 'graded' ? 'bg-slate-800 text-slate-400' :
                    new Date(q.closes_at) <= new Date() ? 'bg-red-900/40 text-red-400' :
                    'bg-green-900/40 text-green-400'
                  }`}>
                    {q.status === 'graded' ? `Graded: ${q.correct_answer?.toUpperCase()}` :
                     new Date(q.closes_at) <= new Date() ? 'Closed' : 'Open'}
                  </span>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    disabled={isPending}
                    className="text-xs px-2 py-1 rounded-lg bg-red-900/40 border border-red-800/50 text-red-400 hover:bg-red-900/60 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Closes: {new Date(q.closes_at).toLocaleString()}
              </p>
              {q.status !== 'graded' && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Set correct answer:</p>
                  <div className="flex gap-2">
                    <button onClick={() => setAnswer(q.id, 'yes')} disabled={isPending}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-green-900/30 border-2 border-green-700 text-green-400 hover:bg-green-900/50 transition-colors">
                      ✓ YES
                    </button>
                    <button onClick={() => setAnswer(q.id, 'no')} disabled={isPending}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-900/30 border-2 border-red-700 text-red-400 hover:bg-red-900/50 transition-colors">
                      ✗ NO
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Users */}
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
                    }`}>{u.status}</span>
                  </div>
                  <div className="col-span-3 text-center text-amber-400">{u.coins}</div>
                  <div className="col-span-2 text-right text-slate-500">{new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
