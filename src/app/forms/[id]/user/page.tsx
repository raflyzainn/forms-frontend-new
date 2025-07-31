// app/forms/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import HomepageHeader from '@/components/common/HomepageHeader'
import { useFetchFormData } from '@/components/fetch/useFetchFormData'
import FormSubmissionWrapper from '@/components/forms/user/FormSubmissionWrapper'
import { Question, Form } from '@/types'
import { getFormStatus } from '@/lib/formUtils'

export default function UserFormPage() {
  const formId = useParams()?.id?.toString() || ''
  const [nik, setNik] = useState('')
  const [form, setForm] = useState<Form | null>(null)
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

    // Fetch form data to check deadline
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

          // Check if form is expired or inactive
          const formStatus = getFormStatus(formData)
          if (!formStatus.isActive || formStatus.isExpired) {
            const params = new URLSearchParams({
              title: formData.title,
              deadline: formData.deadline || '',
              message: formData.deadline_message || ''
            })
            router.push(`/forms/expired?${params.toString()}`)
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error)
      }
    }

    if (formId) {
      fetchFormData()
    }
  }, [formId, router])

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <HomepageHeader
          showResponsesButton={false}
          showCreateFormButton={false}
        />

        {questions.length > 0 && nik ? (
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
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            Pertanyaan atau NIK tidak tersedia.
          </div>
        )}
      </div>
    </div>
  )
}
