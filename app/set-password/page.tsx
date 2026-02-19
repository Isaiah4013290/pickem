'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert('Password set successfully!');
      router.push('/login');
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to set password. Make sure you are approved.');
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Set Your Password</h1>
        <p className="text-slate-400 text-center mb-8">Enter your username and new password.</p>
        
        <form onSubmit={handleSave} className="space-y-4">
          <input
            type="text"
            placeholder="Your Username (e.g. zay)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg outline-none focus:border-amber-400"
            required
          />
          <input
            type="password"
            placeholder="Choose Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg outline-none focus:border-amber-400"
            required
            minLength={6}
          />
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full p-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Password →'}
          </button>
        </form>
      </div>
    </main>
  );
}
