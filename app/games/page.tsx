import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { PickCard } from './PickCard'

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

  const picksByQuestion = new Map(picks?.map(p => [p.question_id, p]) ?? [])

  const open = questions?.filter(q => q.status === 'open') ?? []
  const closed = questions?.filter(q => q.status !== 'open') ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-3xl font-bold">Questions</h1>
          <p className="text-slate-500 text-sm mt-1">
            You have <span className="text-amber-400 font-semibold">{user.coins} coins</span> to wager
          </p>
        </div>
      </div>

      {questions?.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-5xl mb-4">🤔</div>
          <p className="text-lg font-syne">No questions yet</p>
          <p className="text-sm mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="space-y-10">
          {open.length > 0 && (
            <section>
              <h2 className="font-syne text-base font-semibold text-green-400 mb-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-800" />
                Open for picks
                <span className="h-px flex-1 bg-slate-800" />
              </h2>
              <div className="space-y-4">
                {open.map(q => (
                  <PickCard
                    key={q.id}
                    question={q}
                    userPick={picksByQuestion.get(q.id) ?? null}
                    userCoins={user.coins}
                  />
                ))}
              </div>
            </section>
          )}

          {closed.length > 0 && (
            <section>
              <h2 className="font-syne text-base font-semibold text-slate-500 mb-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-800" />
                Closed
                <span className="h-px flex-1 bg-slate-800" />
              </h2>
              <div className="space-y-4">
                {closed.map(q => (
                  <PickCard
                    key={q.id}
                    question={q}
                    userPick={picksByQuestion.get(q.id) ?? null}
                    userCoins={user.coins}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
