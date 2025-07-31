'use client'

import { useEffect, useState, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import HomepageHeader from '@/components/common/HomepageHeader'
import FormSubmissionWrapper from '@/components/forms/user/FormSubmissionWrapper'
import { Question, Form } from '@/types'
import { getFormStatus } from '@/lib/formUtils'

interface FormTokenUserPageProps {
  params: Promise<{
    formToken: string
  }>
}

export default function FormTokenUserPage({ params }: FormTokenUserPageProps) {
  const { formToken } = use(params)
  const [nik, setNik] = useState('')
  const [form, setForm] = useState<Form | null>(null)
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch form data and questions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch form data
        const formResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formToken}/user`)
        if (formResponse.ok) {
          const formData = await formResponse.json()
          setForm(formData.form)
          setTitle(formData.form?.title || '')
          setDescription(formData.form?.description || '')
          setComment(formData.form?.comment || '')

          // Check if form is expired or inactive
          const formStatus = getFormStatus(formData.form)
          if (!formStatus.isActive || formStatus.isExpired) {
            const params = new URLSearchParams({
              title: formData.form.title,
              deadline: formData.form.deadline || '',
              message: formData.form.deadline_message || ''
            })
            router.push(`/forms/expired?${params.toString()}`)
            return
          }
        }

        // Fetch questions
        const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formToken}/questions`)
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json()
          let questionsArray = []
          if (questionsData.questions && questionsData.questions.questions) {
            questionsArray = questionsData.questions.questions
          } else if (Array.isArray(questionsData.questions)) {
            questionsArray = questionsData.questions
          }
          setQuestions(questionsArray)
        }
      } catch (error) {
        console.error('Error fetching form token data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (formToken) {
      fetchData()
    }
  }, [formToken, router])

  // Get NIK from localStorage
  useEffect(() => {
    window.scrollTo(0, 0)
    const storedNik = localStorage.getItem('nik')
    if (storedNik) {
      setNik(storedNik)
    } else {
      alert('NIK tidak ditemukan. Anda harus login ulang.')
    }
  }, [])

  if (loading || !form) return <p className="p-6">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <HomepageHeader
          showResponsesButton={false}
          showCreateFormButton={false}
        />

        {questions.length > 0 && nik && form ? (
          <FormSubmissionWrapper
            questions={questions}
            formId={form.id} // GUNAKAN form.id (UUID) untuk API calls
            nik={nik}
            headerProps={{
              title,
              description,
              comment,
            }}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            {!form ? 'Form tidak ditemukan.' : !questions.length ? 'Pertanyaan tidak tersedia.' : 'NIK tidak tersedia.'}
          </div>
        )}
      </div>
    </div>
  )
} 