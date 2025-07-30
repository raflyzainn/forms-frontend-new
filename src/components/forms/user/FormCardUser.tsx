'use client'

import { Form } from '@/types'
import Link from 'next/link'
import { FiEye, FiFileText, FiClock, FiAlertTriangle } from 'react-icons/fi'
import { getFormStatus, formatDeadline } from '@/lib/formUtils'

interface Props {
  form: Form
  onEdit: (form: Form) => void
  onDelete: (id: string) => void
}

export default function FormCard({ form, onEdit, onDelete }: Props) {
  const formStatus = getFormStatus(form)
  
  // Determine header gradient based on status
  const getHeaderGradient = () => {
    if (!formStatus.isActive) return 'from-red-500 to-red-600'
    if (formStatus.isExpired) return 'from-red-500 to-red-600'
    if (formStatus.daysUntilDeadline !== null && formStatus.daysUntilDeadline <= 3) return 'from-orange-500 to-orange-600'
    return 'from-green-500 to-emerald-600'
  }
  
  // Determine button properties
  const getButtonProps = () => {
    if (!formStatus.isActive || formStatus.isExpired) {
      return {
        href: `/forms/expired?title=${encodeURIComponent(form.title)}&deadline=${encodeURIComponent(form.deadline || '')}&message=${encodeURIComponent(form.deadline_message || '')}`,
        className: 'w-full bg-gray-500 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer',
        text: 'Form Berakhir'
      }
    }
    return {
      href: `/forms/${form.id}/user`,
      className: 'w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2',
      text: 'Lihat Form'
    }
  }
  
  const buttonProps = getButtonProps()
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getHeaderGradient()} rounded-t-lg p-4`}>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <FiFileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate" title={form.title}>
              {form.title}
            </h3>
            <p className="text-white/80 text-sm">Form User</p>
          </div>
        </div>
      </div>

      {/* Content - flex-1 to push buttons to bottom */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${formStatus.statusColor.replace('text-', 'bg-').replace('-600', '-100')} ${formStatus.statusColor}`}>
              {formStatus.isExpired ? (
                <FiAlertTriangle className="w-3 h-3 mr-1" />
              ) : (
                <FiClock className="w-3 h-3 mr-1" />
              )}
              {formStatus.statusText}
            </div>
          </div>

          {/* Deadline Info */}
          {form.deadline && (
            <div className="bg-gray-50 rounded-md p-2">
              <div className="flex items-center text-xs text-gray-600">
                <FiClock className="w-3 h-3 mr-1" />
                <span>Deadline: {formatDeadline(form.deadline)}</span>
              </div>
            </div>
          )}

          {form.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2" title={form.description}>
              {form.description}
            </p>
          )}
          {form.comment && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-blue-800 text-xs italic line-clamp-2" title={form.comment}>
                {form.comment}
              </p>
            </div>
          )}
        </div>

        {/* Action Button - always at bottom */}
        <div className="mt-4">
          <Link
            href={buttonProps.href}
            className={buttonProps.className}
          >
            <FiEye className="w-4 h-4" />
            {buttonProps.text}
          </Link>
        </div>
      </div>
    </div>
  )
}
