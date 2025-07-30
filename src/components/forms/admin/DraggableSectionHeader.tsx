'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Section } from '@/types'
import { getSectionColor } from '@/lib/staticTypes'
import { FiMove, FiEdit, FiTrash2 } from 'react-icons/fi'
import DeleteConfirmation from '@/components/common/DeleteConfirmation'

interface Props {
  section: Section
  index: number
  onEdit: (section: Section) => void
  onDelete: (sectionId: string) => void
  deletingSections: Record<string, boolean>
}

export default function DraggableSectionHeader({
  section,
  index,
  onEdit,
  onDelete,
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
      className={`p-5 ${sectionColor.bg} border-b ${sectionColor.border} flex justify-between items-center group hover:shadow-md transition-all duration-200 sticky top-0 z-20 ${
        isDragging ? 'opacity-50 scale-105 shadow-lg z-30' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 rounded cursor-grab hover:bg-blue-100/80 transition-colors group-hover:bg-blue-200/80 flex-shrink-0"
          title="Drag untuk mengatur posisi section"
          onClick={(e) => e.stopPropagation()}
        >
          <FiMove className="h-5 w-5 text-blue-800 group-hover:text-blue-900 group-hover:scale-110 transition-all duration-200" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold ${sectionColor.text} text-xl break-words`}>
            {section.title}
          </h3>
          {section.description && (
            <p className={`text-sm ${sectionColor.text} mt-2 break-words opacity-90`}>{section.description}</p>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div 
        className="flex gap-2 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="text-blue-800 hover:text-blue-900 text-sm hover:underline whitespace-nowrap font-medium px-3 py-1 rounded-md hover:bg-blue-100/80 transition-colors flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit(section);
          }}
        >
          <FiEdit className="w-3 h-3" />
          Edit
        </button>
        <DeleteConfirmation
          title="Hapus Section?"
          message="Apakah Anda yakin ingin menghapus section ini? Semua pertanyaan dalam section ini juga akan dihapus."
          onConfirm={() => onDelete(section.id)}
          trigger={
                         <button
               className="text-red-800 hover:text-red-900 text-sm hover:underline whitespace-nowrap font-medium px-3 py-1 rounded-md hover:bg-red-100/80 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
               disabled={deletingSections[section.id]}
               onClick={(e) => {
                 e.stopPropagation();
                 e.preventDefault();
               }}
             >
               <FiTrash2 className="w-3 h-3" />
               {deletingSections[section.id] ? 'Menghapus...' : 'Hapus'}
             </button>
          }
        />
      </div>
    </div>
  )
} 