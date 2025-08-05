'use client'

import { useMemo, useState } from 'react'
import { Question, Section, Choice } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  rectIntersection,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import DraggableQuestion from './DraggableQuestion'
import DraggableSectionHeader from './DraggableSectionHeader'
import DraggableChoice from './DraggableChoice'
import DeleteConfirmation from '@/components/common/DeleteConfirmation'
import EditQuestionForm from '@/components/forms/admin/EditQuestionForm'
import { FiPlus, FiMove } from 'react-icons/fi'
import { getSectionColor } from '@/lib/staticTypes'

interface Props {
  questions: Question[]
  onEditSection: (section: Section) => void
  onDeleteSection: (sectionId: string) => void
  onEditQuestion: (questionId: string) => void
  onDeleteQuestion: (questionId: string) => void
  onCopyQuestion: (questionId: string) => void
  onAddQuestion: (afterIndex: number | null) => void
  onReorderQuestions: (newQuestions: Question[]) => void
  onReorderSections?: (newSections: Section[]) => void
  onReorderChoices?: (questionId: string, newChoices: Choice[]) => void
  deletingSections: Record<string, boolean>
  editingQuestionId: string | null
  categories: any[]
  sections: any[]
  onQuestionUpdateSuccess: (updatedQuestion: Question) => void
  isSubmittingEdit: boolean
  setIsSubmittingEdit: (value: boolean) => void
  formId?: string
}

type GroupedQuestions = Record<
  string,
  {
    section: Question['section']
    questions: Question[]
  }
>

export default function FormQuestionGroupAdmin({
  questions,
  onEditSection,
  onDeleteSection,
  onEditQuestion,
  onDeleteQuestion,
  onCopyQuestion,
  onAddQuestion,
  onReorderQuestions,
  onReorderSections,
  onReorderChoices,
  deletingSections,
  editingQuestionId,
  categories,
  sections,
  onQuestionUpdateSuccess,
  isSubmittingEdit,
  setIsSubmittingEdit,
  formId
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const isSectionDrag = sections.some(s => s.id === active.id)
    
    if (isSectionDrag && onReorderSections) {
      const sortedSections = [...sections].sort((a, b) => {
        const aOrder = (a as any)?.order_sequence || 0
        const bOrder = (b as any)?.order_sequence || 0
        return aOrder - bOrder
      })
      
      const oldIndex = sortedSections.findIndex(s => s.id === active.id)
      const newIndex = sortedSections.findIndex(s => s.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newSections = arrayMove(sortedSections, oldIndex, newIndex)
        onReorderSections(newSections)
      }
    } else {
      const oldIndex = questions.findIndex(q => q.questionId === active.id)
      const newIndex = questions.findIndex(q => q.questionId === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newQuestions = arrayMove(questions, oldIndex, newIndex)
        onReorderQuestions(newQuestions)
      }
    }
  }

  const groupedSections = useMemo(() => {
    const result: GroupedQuestions = {}
    
    console.log('Grouping sections - Questions:', questions.length, 'Sections:', sections.length)
    console.log('Sections with order_sequence:', sections.map(s => ({ id: s.id, title: s.title, order_sequence: s.order_sequence })))
    
    questions.forEach((q) => {
      const sectionId = q.section?.id || 'unknown'
      if (!result[sectionId]) {
        const actualSection = sections.find(s => s.id === sectionId)
        console.log('Section mapping:', { 
          sectionId, 
          actualSection: actualSection ? { 
            id: actualSection.id, 
            title: actualSection.title, 
            order_sequence: actualSection.order_sequence 
          } : null, 
          questionSection: q.section 
        })
        result[sectionId] = {
          section: actualSection || q.section,
          questions: []
        }
      }
      result[sectionId].questions.push(q)
    })
    
    console.log('Grouped sections result:', Object.keys(result))
    return result
  }, [questions, sections])

  const sortedGroupedSections = useMemo(() => {
    const sectionsArray = Object.values(groupedSections)
    const sorted = sectionsArray.sort((a, b) => {
      const aOrder = (a.section as any)?.order_sequence || 0
      const bOrder = (b.section as any)?.order_sequence || 0
      return aOrder - bOrder
    })
    
    console.log('Sorted sections by order_sequence:', sorted.map(s => ({
      title: s.section?.title,
      order_sequence: (s.section as any)?.order_sequence
    })))
    
    return sorted
  }, [groupedSections])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
    >
      <div>


        {questions.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow-sm mt-4">
            <p className="text-gray-500 text-center">Belum ada pertanyaan</p>
          </div>
        ) : (
          <div className="space-y-8 mt-4">
            {sortedGroupedSections.map((group, sectionIndex) => {
              const section = group.section;
              
              return (
                <div
                  key={section?.id || sectionIndex}
                  className="bg-white rounded-lg shadow-sm overflow-hidden relative"
                >
                  {section?.id && onReorderSections ? (
                    <DraggableSectionHeader
                      section={section as any}
                      index={sectionIndex}
                      onEdit={onEditSection}
                      onDelete={onDeleteSection}
                      deletingSections={deletingSections}
                    />
                  ) : (
                    <div className={`p-5 ${getSectionColor(sectionIndex).bg} border-b ${getSectionColor(sectionIndex).border} flex justify-between items-center group hover:shadow-md transition-all duration-200 sticky top-0 z-20`}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold ${getSectionColor(sectionIndex).text} text-xl break-words`}>
                            {section?.title || 'Tanpa Bagian'}
                          </h3>
                          {section?.description && (
                            <p className={`text-sm ${getSectionColor(sectionIndex).text} mt-2 break-words opacity-90`}>{section.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                <SortableContext
                  items={group.questions.map(q => q.questionId)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-6 mt-4">
                    {group.questions.map((q, index) => (
                      <DraggableQuestion
                        key={q.questionId}
                        question={q}
                        index={index}
                        onEdit={onEditQuestion}
                        onDelete={onDeleteQuestion}
                        onCopy={() => onCopyQuestion(q.questionId)}
                        isEditing={editingQuestionId === q.questionId}
                        editingQuestionId={editingQuestionId}
                        categories={categories}
                        sections={sections}
                        onQuestionUpdateSuccess={onQuestionUpdateSuccess}
                        isSubmittingEdit={isSubmittingEdit}
                        setIsSubmittingEdit={setIsSubmittingEdit}
                        EditQuestionForm={EditQuestionForm}
                        onReorderChoices={onReorderChoices}
                      />
                    ))}
                    
                    <li className="flex justify-center mt-6 mb-2">
                      <button
                        onClick={() => onAddQuestion(group.questions.length > 0 ? group.questions.length - 1 : null)}
                        className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-full text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Pertanyaan
                      </button>
                    </li>
                  </ul>
                </SortableContext>
              </div>
            );
          })}
          </div>
        )}
      </div>


    </DndContext>
  )
}
