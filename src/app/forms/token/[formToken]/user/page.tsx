'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import HomepageHeader from '@/components/common/HomepageHeader'
import FormSubmissionWrapper from '@/components/forms/user/FormSubmissionWrapper'
import { resolveCustomURL, checkUserSubmission } from '@/lib/api'
import { getFormStatus } from '@/lib/formUtils'
import { useFetchFormData } from '@/components/fetch/useFetchFormData'
import { FiCheckCircle, FiEdit, FiClock } from 'react-icons/fi'

interface FormTokenUserPageProps {
  params: Promise<{ formToken: string }>
}

export default function FormTokenUserPage({ params }: FormTokenUserPageProps) {
  const { formToken } = use(params)
  const [checkingSubmission, setCheckingSubmission] = useState(true)
  const router = useRouter()
  const [form, setForm] = useState<any>(null)
  const [nik, setNik] = useState<string | null>(null)
  const [userSubmission, setUserSubmission] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  // ✅ fetch data only when form.id is available
  const {
    title,
    description,
    sections,
    comment,
    questions,
    loading: loadingFormData,
  } = useFetchFormData(form?.id) // tambahkan condition fetch

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formToken}/user`)
        if (!res.ok) throw new Error('Gagal mengambil form')

        const response = await res.json()

        const formData = response.form // karena field-nya `form`, bukan `response.data.form`
        setForm(formData)

        // lanjut logic kamu di bawah...

      } catch (err) {
        console.error('Gagal resolve form:', err)
        router.push('/')
      } finally {
        setChecking(false)
      }
    }

    fetchForm()
  }, [formToken, router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNik = localStorage.getItem('nik')
      console.log('[DEBUG] NIK ditemukan di localStorage:', storedNik)
      setNik(storedNik)
    }
  }, [])

  useEffect(() => {
    const fetchUserSubmission = async () => {
      if (!form?.id || !nik) return
  
      try {
        const submission = await checkUserSubmission(form.id, nik)
        setUserSubmission(submission)
      } catch (err) {
        console.error('Gagal cek submission user:', err)
      } finally {
        setCheckingSubmission(false) // ✅ selesai cek
      }
    }
  
    fetchUserSubmission()
  }, [form?.id, nik])  
  

  if (checking || loadingFormData || loadingFormData) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <HomepageHeader showResponsesButton={false} showCreateFormButton={false} isAdminPage={false} />
          <div className="bg-white p-8 rounded-lg shadow-lg text-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {checkingSubmission ? 'Memeriksa apakah Anda sudah mengisi form...' : 'Memeriksa status form...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (userSubmission) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <HomepageHeader showResponsesButton={false} showCreateFormButton={false} isAdminPage={false} />

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
                onClick={() => router.push(`/forms/${form.id}/edit-submission/${userSubmission.id}`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiEdit className="w-5 h-5" />
                Edit Submission
              </button>

              <button
                onClick={() => router.push(`/forms/${form.id}/user-responses`)}
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
        <HomepageHeader showResponsesButton={false} showCreateFormButton={false} isAdminPage={false} />

        {!nik ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Memuat NIK dari localStorage...</p>
          </div>
        ) : form && questions.length > 0 ? (
          <div className="mt-8">
            <FormSubmissionWrapper
              questions={questions}
              formId={form.id}
              sections={sections}
              nik={nik}
              headerProps={{ title, description, comment }}
            />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center mt-8">
            <p className="text-gray-500">
              {!form
                ? 'Form tidak ditemukan.'
                : !questions.length
                ? 'Pertanyaan tidak tersedia.'
                : 'NIK tidak tersedia.'}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
