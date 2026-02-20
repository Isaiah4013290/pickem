import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { settleParlaysForQuestion } from '@/lib/settleParlays'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { question, closes_at } = await req.json()
  if (!question || !closes_at) return NextResponse.json({ error: 'Question and close time are required' }, { status: 400 })
  const { error } = await supabase.from('questions').insert({
    question,
    closes_at: new Date(closes_at).toISOString(),
    status: 'open',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { questionId, question } = await req.json()
  if (!questionId || !question) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { error } = await supabase
    .from('questions')
    .update({ question })
    .eq('id', questionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { questionId, correct_answer } = await req.json()
  if (!['yes', 'no'].includes(correct_answer)) return NextResponse.json({ error: 'Answer must be yes or no' }, { status: 400 })
  const { error } = await supabase
    .from('questions')
    .update({ correct_answer, status: 'graded' })
    .eq('id', questionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('parlay_legs').update({ is_correct: true }).eq('question_id', questionId).eq('pick', correct_answer)
  await supabase.from('parlay_legs').update({ is_correct: false }).eq('question_id', questionId).neq('pick', correct_answer)
  await settleParlaysForQuestion(questionId)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { questionId } = await req.json()
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
