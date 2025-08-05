'use client'

import { Question, Section } from '@/types'
import { useMemo } from 'react'
import QuestionInputRenderer from '@/components/forms/QuestionInputRenderer'
import { getSectionColor } from '@/lib/staticTypes'

interface Props {
  questions: Question[]
  sections: Section[] // ✅ ini penting
  onAnswerChange: (questionId: string, questionType: string, answer: any) => void
  answers: Record<string, { type: string; answer: any }>
  nik: string
  formId: string
}

type GroupedQuestions = Record<
  string,
  {
    section: Question['section']
    questions: Question[]
  }
>

export default function FormQuestionGroup({ questions, sections, onAnswerChange, answers, nik, formId }: Props) {
  const groupedSections = useMemo(() => {
    const result: GroupedQuestions = {}
    const safeSections = sections || [] // 🛡️ handle undefined
  
    questions.forEach((q) => {
      const sectionId = q.section?.id || 'unknown'
      if (!result[sectionId]) {
        const actualSection = safeSections.find(s => s.id === sectionId)
        result[sectionId] = {
          section: actualSection || q.section,
          questions: []
        }
      }
      result[sectionId].questions.push(q)
    })
  
    return Object.values(result).sort((a, b) => {
      const aOrder = a.section?.order_sequence ?? 0
      const bOrder = b.section?.order_sequence ?? 0
      return aOrder - bOrder
    })
  }, [questions, sections])
  

  return (
    <div>
      {questions.length === 0 ? (
        <div className="bg-white p-6 rounded-b-lg border border-gray-200 border-t-0 shadow-sm">
          <p className="text-gray-500 text-center">Tidak ada pertanyaan untuk form ini.</p>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {Object.values(groupedSections).map((group, sectionIndex) => {
            const sectionColor = getSectionColor(sectionIndex);
            return (
              <div
                key={group.section?.id || sectionIndex}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* Section Header */}
                <div className={`bg-gradient-to-r ${sectionColor.from} ${sectionColor.to} px-6 py-4`}>
                  <h2 className="text-xl font-bold text-white">
                    {group.section?.section || group.section?.title || 'Tanpa Bagian'}
                  </h2>
                  {group.section?.description && (
                    <p className="text-white/80 text-sm mt-1">{group.section.description}</p>
                  )}
                </div>
                
                {/* Section Content */}
                <div className="p-6">

                                <ul className="space-y-6">
                    {group.questions.map((q, index) => (
                      <li key={q.questionId || `${group.section?.id}-${index}`} className="pb-6 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-800 mb-1">
                            {index + 1}. {q.title}
                            {q.mandatory && <span className="text-red-500 ml-1">*</span>}
                          </p>

                          {q.description && (
                            <p className="text-sm text-gray-500 mb-2">{q.description}</p>
                          )}

                          {q.comment && (
                            <p className="text-xs text-gray-400 mb-3">{q.comment}</p>
                          )}

                          <QuestionInputRenderer
                            question={q}
                            name={`question-${q.questionId}`}
                            onAnswerChange={(answer) =>
                              onAnswerChange(q.questionId, q.type?.type || "2", answer)
                            }
                            answer={answers[q.questionId]?.answer}
                            nik={nik}
                            formId={formId}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          </div>
      )}
    </div>
  )
}
