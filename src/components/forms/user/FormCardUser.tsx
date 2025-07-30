'use client'

import { Form } from '@/types'
import Link from 'next/link'
import { FiEye, FiFileText } from 'react-icons/fi'

interface Props {
  form: Form
  onEdit: (form: Form) => void
  onDelete: (id: string) => void
}

export default function FormCard({ form, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-lg p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <FiFileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate" title={form.title}>
              {form.title}
            </h3>
            <p className="text-green-100 text-sm">Form User</p>
          </div>
        </div>
      </div>

      {/* Content - flex-1 to push buttons to bottom */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
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
            href={`/forms/${form.id}/user`}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            Lihat Form
          </Link>
        </div>
      </div>
    </div>
  )
}
