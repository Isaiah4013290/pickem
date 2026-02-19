'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  // ... other logic you might have ...

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-8">Sign In</h1>
        
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg outline-none focus:border-amber-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-lg outline-none focus:border-amber-400"
          />
          <button className="w-full p-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300">
            Sign In
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <Link href="/join" className="block text-sm text-slate-400 hover:text-white">
            Need an account? <span className="text-amber-400">Request Access</span>
          </Link>
          
          <hr className="border-slate-800" />
          
          <Link 
            href="/set-password" 
            className="block text-sm text-amber-400 font-semibold hover:underline"
          >
            Approved? Set your password here →
          </Link>
        </div>
      </div>
    </main>
  );
}
