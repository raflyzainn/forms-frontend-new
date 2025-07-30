'use client'

import { Question } from '@/types'
import { useMemo } from 'react'
import QuestionInputRenderer from './QuestionInputRenderer'

interface Props {
  questions: Question[]
}

type GroupedQuestions = Record<
  string,
  {
    section: Question['section']
    questions: Question[]
  }
>

export default function FormQuestionGroup({ questions }: Props) {
  const groupedSections = useMemo(() => {
    const result: GroupedQuestions = {}
    questions.forEach((q) => {
      const sectionId = q.section?.id || 'unknown'
      if (!result[sectionId]) {
        result[sectionId] = {
          section: q.section,
          questions: []
        }
      }
      result[sectionId].questions.push(q)
    })
    return result
  }, [questions])

  return (
    <div>
      {questions.length === 0 ? (
        <div className="bg-white p-6 rounded-b-lg border border-gray-200 border-t-0 shadow-sm">
          <p className="text-gray-500 text-center">Tidak ada pertanyaan untuk form ini.</p>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {Object.values(groupedSections).map((group, sectionIndex) => (
            <div
              key={group.section?.id || sectionIndex}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                {group.section?.section || 'Tanpa Bagian'}
              </h2>
              {group.section?.description && (
                <p className="text-sm text-gray-500 mb-4">{group.section.description}</p>
              )}

              <ul className="space-y-6">
                {group.questions.map((q, index) => (
                  <li key={q.questionId || index} className="pb-6 border-b border-gray-200 last:border-b-0">
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

                      <QuestionInputRenderer question={q} name={`question-${q.questionId}`} />
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
