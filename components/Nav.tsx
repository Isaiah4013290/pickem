import Link from 'next/link'
import { getSessionUser } from '@/lib/auth'
import { LogoutButton } from './LogoutButton'

export async async function Nav() {
  const user = await getSessionUser()

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/games" className="font-syne font-extrabold text-xl tracking-tight">
          <span className="text-amber-400">Pick</span><span className="text-slate-100">'em</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            <Link href="/games" className="nav-link">Games</Link>
            <Link href="/leaderboard" className="nav-link">Board</Link>
            <Link href="/dashboard" className="nav-link">
              <span className="text-amber-400 font-semibold">{user.coins}🪙</span>
            </Link>
            {user.is_admin && (
              <Link href="/admin" className="nav-link text-amber-400">Admin</Link>
            )}
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="nav-link">Sign in</Link>
            <Link href="/join" className="btn-primary">Join</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
