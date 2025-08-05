'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { resolveCustomURL } from '@/lib/api'
import { CustomURLResponse } from '@/types'

interface CustomSlugPageProps {
  params: Promise<{
    customSlug: string
  }>
}

export default function CustomSlugPage({ params }: CustomSlugPageProps) {
  const { customSlug } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCustomSlug = async () => {
      try {
        setLoading(true)
        const response: CustomURLResponse = await resolveCustomURL(customSlug)
        
        if (response.form.deadline) {
          const now = new Date()
          const deadline = new Date(response.form.deadline)
          const isExpired = now > deadline
          
          if (isExpired) {
            const params = new URLSearchParams({
              title: response.form.title,
              deadline: response.form.deadline,
              message: response.form.deadline_message || 'Form telah melewati batas waktu yang ditentukan.'
            })
            router.push(`/forms/expired?${params.toString()}`)
            return
          }
        }
        
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        
        if (!isLoggedIn) {
          const targetUrl = response.redirect_type === 'admin' 
            ? `/forms/token/${response.form_token}/admin`
            : `/forms/token/${response.form_token}/user`
          
          sessionStorage.setItem('redirectAfterLogin', targetUrl)
          router.push('/')
          return
        }
        
        if (response.redirect_type === 'user') {
          router.push(`/forms/token/${response.form_token}/user`)
        } else if (response.redirect_type === 'admin') {
          router.push(`/forms/token/${response.form_token}/admin`)
        } else {
          router.push(`/forms/token/${response.form_token}/user`)
        }
      } catch (err) {
        console.error('Error resolving custom URL:', err)
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }

    handleCustomSlug()
  }, [customSlug, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/forms')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return null
} 