import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const questionId = searchParams.get('questionId')
  if (!questionId) return NextResponse.json({ error: 'Missing questionId' }, { status: 400 })

  const { data, error } = await supabase
    .from('comments')
    .select('id, text, created_at, user_id')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = [...new Set(data?.map(c => c.user_id) ?? [])]
  const { data: users } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds)

  const usersMap = new Map(users?.map(u => [u.id, u.username]) ?? [])

  const comments = data?.map(c => ({
    id: c.id,
    text: c.text,
    created_at: c.created_at,
    users: { username: usersMap.get(c.user_id) ?? 'Unknown' }
  }))

  return NextResponse.json({ comments })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { questionId, text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Empty comment' }, { status: 400 })

  const { error } = await supabase.from('comments').insert({
    user_id: user.id,
    question_id: questionId,
    text: text.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
