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
        <p className="text-xs text-slate-600 mt-6">Fo
