import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to Pick'em</h1>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-2 bg-amber-400 text-black rounded-lg font-bold">
          Login
        </Link>
        <Link href="/join" className="px-6 py-2 border border-amber-400 text-amber-400 rounded-lg font-bold">
          Join Now
        </Link>
      </div>
    </main>
  );
}
