import { Form } from '@/types'

export interface FormStatus {
  isActive: boolean
  isExpired: boolean
  isOpen: boolean
  daysUntilDeadline: number | null
  statusText: string
  statusColor: string
}

export function getFormStatus(form: Form): FormStatus {
  const now = new Date()
  const deadline = form.deadline ? new Date(form.deadline) : null
  const openedDate = form.opened_date ? new Date(form.opened_date) : null
  
  // Check if form is active (admin setting)
  const isActive = form.is_active ?? true
  
  // Check if form is expired (past deadline)
  const isExpired = deadline ? now > deadline : false
  
  // Check if form is open (between opened_date and deadline)
  const isOpen = isActive && !isExpired && 
    (!openedDate || now >= openedDate) && 
    (!deadline || now <= deadline)
  
  // Calculate days until deadline
  let daysUntilDeadline: number | null = null
  if (deadline && !isExpired) {
    const diffTime = deadline.getTime() - now.getTime()
    daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  
  // Determine status text and color
  let statusText = 'Aktif'
  let statusColor = 'text-green-600'
  
  if (!isActive) {
    statusText = 'Nonaktif'
    statusColor = 'text-red-500'
  } else if (isExpired) {
    statusText = 'Berakhir'
    statusColor = 'text-red-600'
  } else if (daysUntilDeadline !== null && daysUntilDeadline <= 3) {
    statusText = `Berakhir dalam ${daysUntilDeadline} hari`
    statusColor = 'text-orange-600'
  } else if (daysUntilDeadline !== null) {
    statusText = `Berakhir dalam ${daysUntilDeadline} hari`
    statusColor = 'text-blue-600'
  }
  
  return {
    isActive,
    isExpired,
    isOpen,
    daysUntilDeadline,
    statusText,
    statusColor
  }
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function canUserAccessForm(form: Form): boolean {
  const status = getFormStatus(form)
  return status.isActive && !status.isExpired
} 