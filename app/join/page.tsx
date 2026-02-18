'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim() }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-950">
        <div className="w-full max-w-sm card p-8 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="font-syne text-2xl font-bold mb-2">Request sent!</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your username <span className="text-amber-400 font-semibold">@{username}</span> is pending approval.
            Check back soon — once approved you'll be able to set your password and start picking.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-ghost w-full mt-6"
          >
            Check status →
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-6">For fun predictions only. No money involved.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-950">
      <div className="mb-8 text-center">
        <h1 className="font-syne text-3xl font-extrabold">
          <span className="text-amber-400">Pick</span><span className="text-slate-100">'em</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">High School Sports Predictions</p>
      </div>

      <div className="w-full max-w-sm card p-8">
        <h2 className="font-syne text-xl font-bold mb-1">Request access</h2>
        <p className="text-slate-500 text-sm mb-6">Pick a username to get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="input-field"
              placeholder="e.g. gridiron_king"
              maxLength={20}
              required
            />
            <p className="text-xs text-slate-600 mt-1.5">2–20 chars · letters, numbers, underscores</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Submitting...' : 'Request username →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already approved?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300">Sign in</Link>
        </p>
      </div>

      <p className="text-xs text-slate-600 mt-6">For fun predictions only. No money involved.</p>
    </div>
  )
}
