'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Section } from '@/types'
import { getSectionColor } from '@/lib/staticTypes'
import { FiMove } from 'react-icons/fi'

interface Props {
  section: Section
  index: number
  onEdit: (section: Section) => void
  onDelete: (sectionId: string) => void
  isEditing: boolean
  deletingSections: Record<string, boolean>
}

export default function DraggableSection({
  section,
  index,
  onEdit,
  onDelete,
  isEditing,
  deletingSections
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const sectionColor = getSectionColor(index)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border-2 ${
        isDragging ? 'opacity-50 border-blue-300' : 'border-transparent'
      } transition-all duration-200`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <FiMove className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${sectionColor.bg} ${sectionColor.text} mb-2`}>
                Section {index + 1}
              </div>
              <h3 className="font-semibold text-lg text-gray-900">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(section)}
              disabled={isEditing}
              className="text-blue-500 text-sm hover:underline disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(section.id)}
              disabled={deletingSections[section.id]}
              className="text-red-500 text-sm hover:underline disabled:opacity-50"
            >
              {deletingSections[section.id] ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 