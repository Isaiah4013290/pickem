'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        // Success! Go to login
        router.push('/login');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to set password.');
      }
    } catch (err) {
      alert('Connection error. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Set Your Password</h1>
        <p className="text-slate-400 mb-8 text-center">Create a password for @zay</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg focus:border-amber-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Password →'}
          </button>
        </form>
      </div>
    </main>
  );
}
