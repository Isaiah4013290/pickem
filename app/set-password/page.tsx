'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This calls your API to save the password in Supabase
    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      router.push('/login');
    } else {
      alert('Failed to set password. Try again.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Set Your Password</h1>
        <p className="text-slate-400 text-center mb-8">Choose a password for your account.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg outline-none focus:border-amber-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors"
          >
            Save Password →
          </button>
        </form>
      </div>
    </main>
  );
}
