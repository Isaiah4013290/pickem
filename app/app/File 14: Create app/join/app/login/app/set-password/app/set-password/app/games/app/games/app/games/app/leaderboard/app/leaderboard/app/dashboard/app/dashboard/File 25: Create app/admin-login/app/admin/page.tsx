import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { AdminActions } from './AdminActions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user || !user.is_admin) redirect('/admin-login')

  const { data: sports } = await supabase.from('sports').select('*').order('name')
  const { data: pendingUsers } = await supabase
    .from('users')
    .select('id, username, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: games } = await supabase
    .from('games')
    .select('*, sports(*)')
    .order('game_time', { ascending: false })
    .limit(30)

  const { data: allUsers } = await supabase
    .from('users')
    .select('id, username, status, coins, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">Manage users, games, and scores</p>
      </div>

      <AdminActions
        sports={sports ?? []}
        games={games ?? []}
        pendingUsers={pendingUsers ?? []}
        allUsers={allUsers ?? []}
      />
    </div>
  )
}
