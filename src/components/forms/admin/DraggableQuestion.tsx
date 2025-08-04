'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Question } from '@/types'
import QuestionInputRenderer from '@/components/forms/QuestionInputRenderer'
import DraggableChoice from './DraggableChoice'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DndContext, DragEndEvent, rectIntersection } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { FiMove, FiEdit, FiTrash2, FiCopy } from 'react-icons/fi'
import { useState } from 'react'
import { copyQuestion } from '@/lib/api'
import { toast } from 'react-toastify'

interface Props {
  question: Question
  index: number
  onEdit: (questionId: string) => void
  onDelete: (questionId: string) => void
  onCopy: () => void
  isEditing: boolean
  editingQuestionId: string | null
  categories: any[]
  sections: any[]
  onQuestionUpdateSuccess: (updatedQuestion: Question) => void
  isSubmittingEdit: boolean
  setIsSubmittingEdit: (value: boolean) => void
  EditQuestionForm: any
  onReorderChoices?: (questionId: string, newChoices: any[]) => void
}

export default function DraggableQuestion({
  question,
  index,
  onEdit,
  onDelete,
  onCopy,
  isEditing,
  editingQuestionId,
  categories,
  sections,
  onQuestionUpdateSuccess,
  isSubmittingEdit,
  setIsSubmittingEdit,
  EditQuestionForm,
  onReorderChoices
}: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.questionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    console.log('Delete confirmed for question:', question.questionId);
    setIsDeleting(true);
    try {
      await onDelete(question.questionId);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const handleCopy = async () => {
    console.log('Copying question:', question.questionId);
    setIsCopying(true);
    try {
      // Only call the parent's onCopy function, let parent handle the API call and toast
      onCopy();
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyalin pertanyaan');
    } finally {
      setIsCopying(false);
    }
  }

  const handleChoiceDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    if (question.choices && onReorderChoices) {
      const oldIndex = question.choices.findIndex((c, index) => 
        (c.choiceId || `${question.questionId}-choice-${index}`) === active.id
      )
      const newIndex = question.choices.findIndex((c, index) => 
        (c.choiceId || `${question.questionId}-choice-${index}`) === over.id
      )
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newChoices = arrayMove(question.choices, oldIndex, newIndex)
        const transformedChoices = newChoices.map((choice, index) => ({
          id: choice.choiceId,
          choice_id: choice.choiceId,
          question_id: question.questionId,
          title: choice.title,
          order_sequence: index + 1
        }))
        onReorderChoices(question.questionId, transformedChoices)
      }
    }
  }

  if (editingQuestionId === question.questionId) {
    return (
      <li ref={setNodeRef} style={style} className="relative pb-6 border-b border-gray-200 last:border-b-0">
        <EditQuestionForm
          question={question}
          formId={question.form_id}
          categories={categories}
          sections={sections}
          onCancel={() => onEdit('')}
          onSuccess={onQuestionUpdateSuccess}
          isSubmitting={isSubmittingEdit}
          setIsSubmitting={setIsSubmittingEdit}
        />
      </li>
    )
  }

  return (
    <li 
      ref={setNodeRef} 
      style={style} 
      className={`relative pb-6 border-b border-gray-200 last:border-b-0 group hover:bg-blue-50/20 transition-colors rounded-lg p-4 ${
        isDragging ? 'shadow-lg z-10' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-8 h-8 rounded cursor-grab hover:bg-gray-100 transition-colors group-hover:bg-blue-100 flex-shrink-0"
              title="Drag untuk mengatur posisi"
              onClick={(e) => e.stopPropagation()}
            >
              <FiMove className="text-gray-400 group-hover:text-blue-600" />
            </div>
            
            {/* Question Number */}
            <span className="font-medium text-gray-800 whitespace-nowrap text-lg">
              {index + 1}.
            </span>
            
            {/* Question Content */}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-800 break-words text-lg">
                {question.title}
                {question.mandatory && <span className="text-red-500 ml-1">*</span>}
              </p>
              {question.description && (
                <p className="text-sm text-gray-600 mt-2 break-words">{question.description}</p>
              )}
              {question.comment && (
                <p className="text-xs text-gray-500 mt-1 break-words italic">{question.comment}</p>
              )}
            </div>
          </div>
          
          {/* Question Input Preview - Using QuestionInputRenderer like user page */}
          <div className="mt-4 ml-11">
            <QuestionInputRenderer
              question={question}
              name={`question-${question.questionId}`}
              onAnswerChange={() => {}} // Empty function for read-only
              answer={undefined} // No answer for admin preview
              nik="admin"
              formId={question.form_id || ""}
              readOnly={true} // This makes it read-only
            />
          </div>
          
          {/* Draggable Choices Section */}
          {question.choices && question.choices.length > 0 && (
            <div className="mt-4 ml-11">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Pilihan Jawaban (Drag untuk mengatur urutan):
                </p>
                <DndContext
                  collisionDetection={rectIntersection}
                  onDragEnd={handleChoiceDragEnd}
                >
                  <SortableContext
                    items={question.choices.map((c, index) => c.choiceId || `${question.questionId}-choice-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {question.choices.map((choice, choiceIndex) => (
                        <DraggableChoice
                          key={`${question.questionId}-${choice.choiceId || choiceIndex}`}
                          choice={{
                            id: choice.choiceId,
                            choice_id: choice.choiceId,
                            question_id: question.questionId,
                            title: choice.title,
                            order_sequence: choiceIndex + 1
                          }}
                          index={choiceIndex}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}
          

        </div>
        
        {/* Action Buttons */}
        <div 
          className="flex sm:flex-col gap-2 sm:gap-2 justify-end sm:items-end flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="text-blue-600 text-sm hover:underline whitespace-nowrap font-medium px-3 py-1 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit(question.questionId);
            }}
          >
            <FiEdit className="w-3 h-3" />
            Edit
          </button>
          <button
            className="text-green-600 text-sm hover:underline whitespace-nowrap font-medium px-3 py-1 rounded-md hover:bg-green-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleCopy();
            }}
            disabled={isCopying}
          >
            <FiCopy className="w-3 h-3" />
            {isCopying ? 'Menyalin...' : 'Salin'}
          </button>
          <button
            className="text-red-500 text-sm hover:underline whitespace-nowrap font-medium px-3 py-1 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Delete button clicked for question:', question.questionId);
              setShowDeleteConfirm(true);
            }}
            disabled={isDeleting}
          >
            <FiTrash2 className="w-3 h-3" />
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
      
      {/* Simple Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Hapus Pertanyaan?</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-blue-400 bg-blue-50 rounded-lg pointer-events-none" />
      )}
    </li>
  )
} 