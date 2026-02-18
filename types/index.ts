export type UserStatus = 'pending' | 'approved' | 'denied'

export interface User {
  id: string
  username: string
  password_hash: string | null
  status: UserStatus
  is_admin: boolean
  coins: number
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface Sport {
  id: string
  name: string
  emoji: string
  created_at: string
}

export interface Game {
  id: string
  sport_id: string
  home_team: string
  away_team: string
  game_date: string
  game_time: string
  location: string | null
  status: 'upcoming' | 'live' | 'final'
  home_score: number | null
  away_score: number | null
  winner: 'home' | 'away' | 'tie' | null
  created_at: string
  updated_at: string
}

export interface Pick {
  id: string
  user_id: string
  game_id: string
  pick: 'home' | 'away'
  wager: number
  is_correct: boolean | null
  payout: number | null
  created_at: string
  updated_at: string
}

export interface CoinTransaction {
  id: string
  user_id: string
  amount: number
  reason: string
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  username: string
  coins: number
  total_graded: number
  correct_picks: number
  accuracy: number
}

export type GameWithSport = Game & { sports: Sport }
export type GameWithSportAndPick = GameWithSport & { userPick?: Pick }

export interface SessionUser {
  id: string
  username: string
  is_admin: boolean
  coins: number
}
