import Link from 'next/link'

export default function PendingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-950">
      <div className="w-full max-w-sm card p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-syne text-2xl font-bold mb-2">Pending Approval</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Your username request is waiting for admin approval.
          Check back soon!
        </p>
        <Link href="/login" className="btn-ghost w-full block">
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
