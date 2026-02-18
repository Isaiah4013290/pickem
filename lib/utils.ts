export function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function isGameLocked(gameTime: string): boolean {
  return new Date(gameTime) <= new Date()
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'upcoming': return 'text-amber-400'
    case 'live': return 'text-green-400'
    case 'final': return 'text-slate-400'
    default: return 'text-slate-400'
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'upcoming': return 'Upcoming'
    case 'live': return '● LIVE'
    case 'final': return 'Final'
    default: return status
  }
}
