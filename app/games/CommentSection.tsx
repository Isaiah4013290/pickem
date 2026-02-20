'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  text: string
  created_at: string
  users: { username: string }
}

export function CommentSection({ questionId, userPick }: { questionId: string, userPick?: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?questionId=${questionId}`)
    const data = await res.json()
    if (data.comments) setComments(data.comments)
  }

  useEffect(() => {
    if (open) fetchComments()
  }, [open])

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, text }),
    })
    setText('')
    await fetchComments()
    setLoading(false)
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {open ? '▲ Hide comments' : `💬 Comments${comments.length > 0 ? ` (${comments.length})` : ''}`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No comments yet — talk some trash!</p>
            ) : comments.map(c => (
              <div key={c.id} className="bg-slate-800/60 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-400">@{c.users?.username}</span>
                  {userPick && (
                    <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-full text-slate-400">
                      Picked: {userPick.toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-slate-600 ml-auto">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={postComment} className="flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Talk trash..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="btn-primary text-xs px-3 py-2"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
