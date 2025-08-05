'use client'

import { Form } from '@/types'
import Link from 'next/link'
import { FiEye, FiEdit, FiTrash2, FiFileText, FiClock, FiAlertTriangle } from 'react-icons/fi'
import DeleteConfirmation from '../../common/DeleteConfirmation'
import { getFormStatus, formatDeadline } from '@/lib/formUtils'

interface Props {
  form: Form
  onEdit: (form: Form) => void
  onDelete: (id: string) => void
}

export default function FormCard({ form, onEdit, onDelete }: Props) {
  const formStatus = getFormStatus(form)
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <FiFileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate" title={form.title}>
              {form.title}
            </h3>
            <p className="text-blue-100 text-sm">Form Admin</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-yellow-800 text-xs italic line-clamp-2" title={form.comment}>
                {form.comment}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Link
            href={`/forms/${form.id}/admin`}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            Lihat
          </Link>

          <button
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
            onClick={() => onEdit(form)}
          >
            <FiEdit className="w-4 h-4" />
            Edit
          </button>

          <DeleteConfirmation
            title="Hapus Form?"
            message="Apakah Anda yakin ingin menghapus form ini? Tindakan ini tidak bisa dibatalkan."
            onConfirm={() => onDelete(form.id)}
            trigger={
              <button 
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                title="Hapus Form"
              >
                <FiTrash2 className="w-4 h-4" />
                Hapus
              </button>
            }
          />
        </div>
      </div>
    </div>
  )
}
