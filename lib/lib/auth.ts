import { cookies } from 'next/headers'
import { supabase } from './supabase'
import { SessionUser } from '@/types'
import bcrypt from 'bcryptjs'

const COOKIE_NAME = 'pickem_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()

  if (!session) return null
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from('sessions').delete().eq('token', token)
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, username, is_admin, coins, status')
    .eq('id', session.user_id)
    .single()

  if (!user || user.status !== 'approved') return null

  return {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin,
    coins: user.coins,
  }
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()

  const { data: session } = await supabase
    .from('sessions')
    .insert({ user_id: userId })
    .select('token')
    .single()

  if (session) {
    cookieStore.set(COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token) {
    await supabase.from('sessions').delete().eq('token', token)
    cookieStore.delete(COOKIE_NAME)
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
