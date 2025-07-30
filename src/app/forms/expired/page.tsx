'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FiClock, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi'
import Image from 'next/image'

export default function FormExpiredPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formTitle = searchParams.get('title') || 'Form'
  const deadline = searchParams.get('deadline')
  const deadlineMessage = searchParams.get('message')

  const handleGoBack = () => {
    router.push('/forms')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Image
            src="/assets/logo kemenkop.png"
            alt="Logo Kemenkop"
            width={120}
            height={60}
            className="mx-auto mb-4"
          />
          
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Telah Berakhir</h1>
          <p className="text-gray-600 mb-6">
            Maaf, form "{formTitle}" sudah tidak dapat diakses karena telah melewati batas waktu.
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <FiClock className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-800">Batas Waktu</span>
          </div>
          {deadline && (
            <p className="text-red-700 font-semibold">
              {new Date(deadline).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
          {deadlineMessage && (
            <p className="text-sm text-red-600 mt-2">{deadlineMessage}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Daftar Form
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Jika Anda memiliki pertanyaan, silakan hubungi administrator sistem.
          </p>
        </div>
      </div>
    </div>
  )
} 