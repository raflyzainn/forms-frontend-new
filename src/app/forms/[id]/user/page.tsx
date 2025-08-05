// app/forms/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import HomepageHeader from '@/components/common/HomepageHeader'
import { useFetchFormData } from '@/components/fetch/useFetchFormData'
import FormSubmissionWrapper from '@/components/forms/user/FormSubmissionWrapper'
import { Question, Form } from '@/types'
import { getFormStatus } from '@/lib/formUtils'
import { checkUserSubmission } from '@/lib/api'
import { FiCheckCircle, FiEdit, FiClock } from 'react-icons/fi'

export default function UserFormPage() {
  const formId = useParams()?.id?.toString() || ''
  const [nik, setNik] = useState('')
  const [form, setForm] = useState<Form | null>(null)
  const [userSubmission, setUserSubmission] = useState<any>(null)
  const [checkingSubmission, setCheckingSubmission] = useState(true)
  const router = useRouter()
  const { title, description, comment, questions, loading } =
    useFetchFormData(formId)

  useEffect(() => {
    window.scrollTo(0, 0)
    const storedNik = localStorage.getItem('nik')
    if (storedNik) {
      setNik(storedNik)
    } else {
      alert('NIK tidak ditemukan. Anda harus login ulang.')
    }

    const fetchFormData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token')
        if (!token) {
          router.push('/')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const formData = await response.json()
          setForm(formData)

          const formStatus = getFormStatus(formData)
          if (!formStatus.isActive || formStatus.isExpired) {
            const params = new URLSearchParams({
              title: formData.title,
              deadline: formData.deadline || '',
              message: formData.deadline_message || ''
            })
            router.push(`/forms/expired?${params.toString()}`)
            return
          }

          if (storedNik) {
            const submission = await checkUserSubmission(formId, storedNik)
            setUserSubmission(submission)
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error)
      } finally {
        setCheckingSubmission(false)
      }
    }

    if (formId) {
      fetchFormData()
    }
  }, [formId, router])

  if (loading || checkingSubmission) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <HomepageHeader
            showResponsesButton={false}
            showCreateFormButton={false}
            isAdminPage={false}
          />
          <div className="bg-white p-8 rounded-lg shadow-lg text-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memeriksa status form...</p>
          </div>
        </div>
      </div>
    )
  }

  if (userSubmission) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <HomepageHeader
            showResponsesButton={false}
            showCreateFormButton={false}
            isAdminPage={false}
          />
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-8">
            <div className="mb-8">
              <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Form Sudah Disubmit</h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Anda telah mengisi form ini sebelumnya. Anda dapat mengedit jawaban Anda atau melihat response yang sudah ada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-lg mx-auto">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <FiClock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Submitted</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {new Date(userSubmission.submitted_date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="font-semibold text-gray-900 text-lg">Selesai</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => router.push(`/forms/${formId}/edit-submission/${userSubmission.id}`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiEdit className="w-5 h-5" />
                Edit Submission
              </button>
              
              <button
                onClick={() => router.push(`/forms/${formId}/user-responses`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <FiCheckCircle className="w-5 h-5" />
                Lihat Response
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <HomepageHeader
          showResponsesButton={false}
          showCreateFormButton={false}
          isAdminPage={false}
        />

        {questions.length > 0 && nik ? (
          <div className="mt-8">
            <FormSubmissionWrapper
              questions={questions}
              formId={formId}
              nik={nik}
              headerProps={{
                title,
                description,
                comment,
              }}
            />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center mt-8">
            <p className="text-gray-500">Pertanyaan atau NIK tidak tersedia.</p>
          </div>
        )}
      </div>
    </div>
  )
}
