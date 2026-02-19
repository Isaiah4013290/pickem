'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      router.push('/dashboard');
    } else if (data.needsPassword) {
      // THIS IS THE KICK: It sends you to set-password with your ID
      router.push(`/set-password?userId=${data.userId}`);
    } else {
      alert(data.error || 'Invalid login');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-8">Sign In</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg outline-none focus:border-amber-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg outline-none focus:border-amber-400"
          />
          <button type="submit" className="w-full p-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors">
            Sign In →
          </button>
        </form>
      </div>
    </main>
  );
}
