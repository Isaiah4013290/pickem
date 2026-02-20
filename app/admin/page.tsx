import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { AdminActions } from './AdminActions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user || !user.is_admin) redirect('/admin-login')

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: pendingUsers } = await supabase
    .from('users')
    .select('id, username, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: allUsers } = await supabase
    .from('users')
    .select('id, username, status, coins, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">Manage questions and users</p>
      </div>

      <AdminActions
        questions={questions ?? []}
        pendingUsers={pendingUsers ?? []}
        allUsers={allUsers ?? []}
      />
    </div>
  )
}
