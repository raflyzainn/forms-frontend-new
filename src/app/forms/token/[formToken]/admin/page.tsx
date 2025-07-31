'use client'

import { useEffect, useState, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import HomepageHeader from '@/components/common/HomepageHeader'
import { Form } from '@/types'

interface FormTokenAdminPageProps {
  params: Promise<{
    formToken: string
  }>
}

export default function FormTokenAdminPage({ params }: FormTokenAdminPageProps) {
  const { formToken } = use(params)
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formToken}/admin`)
        
        if (!response.ok) {
          throw new Error('Form tidak ditemukan atau tidak memiliki akses admin')
        }

        const data = await response.json()
        setForm(data.form)
      } catch (err) {
        console.error('Error fetching form data:', err)
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }

    if (formToken) {
      fetchFormData()
    }
  }, [formToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <HomepageHeader />
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <HomepageHeader />
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push('/forms')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Kembali ke Forms
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <HomepageHeader />
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p>Form tidak ditemukan</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <HomepageHeader />
        
        <div className="bg-white p-6 rounded-lg shadow mt-15">
          <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
          <p className="text-gray-600 mb-4">{form.description}</p>
          
          {form.deadline_info && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Deadline:</strong> {form.deadline_info.message}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/forms/${form.id}/admin`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Full Admin Panel
            </button>
            <button
              onClick={() => router.push(`/forms/${form.id}/responses`)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Lihat Responses
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 