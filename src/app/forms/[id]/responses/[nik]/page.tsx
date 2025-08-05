'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { getFormAnswers, getSections } from '@/lib/api'
import { Answer } from '@/types'
import QuestionInputRenderer from '@/components/forms/QuestionInputRenderer'
import HomepageHeader from '@/components/common/HomepageHeader'
import { QuestionTypeName } from '@/types/enum'
import { STATIC_QUESTION_TYPES, getSectionColor } from '@/lib/staticTypes'
import { FiArrowLeft, FiUser, FiCalendar, FiHash, FiFileText } from 'react-icons/fi'

function getTypeNameFromTypeId(type_id: string): string {
  const found = STATIC_QUESTION_TYPES.find(t => t.id.toLowerCase() === type_id.toLowerCase());
  if (found) {
    return found.name;
  }
  return '';
}

export default function ResponseDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const formId = params.id as string
  const nik = params.nik as string
  const sequence = searchParams.get('sequence') || '1'
  
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [formId, nik, sequence])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [answersData, sectionsData] = await Promise.all([
        getFormAnswers(formId, nik, sequence),
        getSections(formId)
      ])
      setAnswers(answersData)
      setSections(Array.isArray(sectionsData) ? sectionsData : sectionsData.sections || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const sectionIdToName = (id: string) => {
    const found = sections.find((s) => s.id === id)
    return found ? (found.title || found.section || id) : id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail response...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  function formatAnswer(answer: Answer) {
    if (answer.is_multiple_choice) {
      return {
        choiceIds: answer.choices?.map(c => c.choice_id) || [],
        choiceTitles: answer.choices?.map(c => c.choice?.title || '') || [],
        value: answer.value || '',
        documents: answer.documents || [], 
      }
    } else {
      return {
        value: answer.value || '',
        choiceId: answer.value || '',
        choiceTitles: answer.choices?.map(c => c.choice?.title || '') || [],
        documents: answer.documents || [], 
      }
    }
  }

  const groupedBySection = answers.reduce((acc, answer) => {
    const sectionId = answer.question.section_id;
    if (!acc[sectionId]) acc[sectionId] = [];
    acc[sectionId].push(answer);
    return acc;
  }, {} as Record<string, Answer[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <HomepageHeader />
      
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-8 mt-17">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="text-xl text-gray-600" />
              </button>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiFileText className="text-2xl text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Detail Response</h1>
                <p className="text-gray-600">Lihat jawaban lengkap dari submission ini</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiUser className="text-xl text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">NIK</p>
                <p className="font-semibold text-gray-800">{nik}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiHash className="text-xl text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Submit Ke</p>
                <p className="font-semibold text-gray-800">#{sequence}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiCalendar className="text-xl text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Tanggal Submit</p>
                <p className="font-semibold text-gray-800">
                  {answers.length > 0 ? new Date(answers[0].created_time).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedBySection).map(([sectionId, sectionAnswers], sectionIndex) => {
            const sectionColor = getSectionColor(sectionIndex);
            return (
              <div key={sectionId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${sectionColor.from} ${sectionColor.to} px-6 py-4`}>
                  <h2 className="text-xl font-bold text-white">
                    {sectionIdToName(sectionId)}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {sectionAnswers.length} pertanyaan
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-8">
                    {sectionAnswers.map((answer, index) => {
                      const mappedTypeName = getTypeNameFromTypeId(answer.question.type_id);
                      return (
                        <div key={answer.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="mb-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 ${sectionColor.bg} rounded-full flex items-center justify-center ${sectionColor.text} font-semibold text-sm flex-shrink-0 mt-1`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  {answer.question.title}
                                </h3>
                                {answer.question.description && (
                                  <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                                    {answer.question.description}
                                  </p>
                                )}
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                  <span className={`w-2 h-2 ${sectionColor.text.replace('text-', 'bg-')} rounded-full`}></span>
                                  {mappedTypeName}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-11">
                            <QuestionInputRenderer
                              question={{
                                questionId: answer.question.id,
                                form_id: answer.question.form_id,
                                title: answer.question.title || '',
                                description: answer.question.description || undefined,
                                mandatory: answer.question.is_mandatory === '1',
                                comment: answer.question.comment || undefined,
                                type: {
                                  type: answer.question.type_id,
                                  name: mappedTypeName,
                                },
                                category: undefined,
                                section: undefined,
                                choices: answer.choices?.map(c => ({
                                  choiceId: c.choice_id || c.id,
                                  title: c.choice?.title || c.title || ''
                                })) || []
                              }}
                              name={`question-${answer.question.id}`}
                              answer={formatAnswer(answer)}
                              readOnly={true}
                              onAnswerChange={() => {}}
                              nik={nik}
                              formId={formId}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
} 