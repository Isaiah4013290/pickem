import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { GamesClient } from './GamesClient'

export const dynamic = 'force-dynamic'

export default async function GamesPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('user_id', user.id)

  const picksByQuestion: Record<string, any> = {}
  picks?.forEach(p => { picksByQuestion[p.question_id] = p })

  const open = questions?.filter(q => q.status === 'open') ?? []
  const closed = questions?.filter(q => q.status !== 'open') ?? []

  return (
    <GamesClient
      user={user}
      open={open}
      closed={closed}
      picksByQuestion={picksByQuestion}
    />
  )
}
