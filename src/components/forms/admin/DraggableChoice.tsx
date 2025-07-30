import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FiMove } from 'react-icons/fi'

interface Choice {
  id: string
  choice_id: string
  question_id: string
  title?: string
  description?: string
  comment?: string
  order_sequence: number
}

interface Props {
  choice: Choice
  index: number
}

export default function DraggableChoice({
  choice,
  index
}: Props) {
  console.log('DraggableChoice render:', { choiceId: choice.choice_id, title: choice.title, index })
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: choice.choice_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow ${
        isDragging ? 'opacity-50 scale-105 shadow-lg z-10' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="w-4 h-4 text-gray-400 cursor-grab hover:text-blue-600 transition-colors flex items-center justify-center"
        title="Drag untuk mengatur posisi choice"
      >
        <FiMove className="w-3 h-3" />
      </div>

      {/* Radio Button Style */}
      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>

      {/* Choice Content */}
      <span className="text-gray-800 flex-1">{choice.title || `Choice ${index + 1}`}</span>
    </div>
  )
} 