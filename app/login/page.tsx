'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    if (data.needsPassword) {
      router.push(`/set-password?user=${data.user}`)
      return
    }

    router.push('/games')
    router.refresh()
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
        <h2 className="font-syne text-xl font-bold mb-6">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="input-field" placeholder="your username" required />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" placeholder="••••••••" required />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-center text
