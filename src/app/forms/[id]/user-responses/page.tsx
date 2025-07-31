'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getFormSubmissions } from '@/lib/api'
import { Submission } from '@/types'
import HomepageHeader from '@/components/common/HomepageHeader'
import { FiUsers, FiClock, FiArrowRight, FiFileText, FiEdit } from 'react-icons/fi'

export default function UserResponsesListPage() {
  const router = useRouter()
  const { id: formId } = useParams()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userNik, setUserNik] = useState<string | null>(null)

  useEffect(() => {
    const nik = localStorage.getItem('nik')
    setUserNik(nik)
    if (nik) {
      fetchUserSubmissions(nik)
    }
  }, [formId])

  const fetchUserSubmissions = async (nik: string) => {
    try {
      setLoading(true)
      const allSubmissions = await getFormSubmissions(formId as string)
      // Filter submissions for current user only
      const userSubmissions = allSubmissions.filter((sub: any) => sub.nik === nik)
      setSubmissions(userSubmissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil submissions')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data responses...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <HomepageHeader isAdminPage={false} />
      
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 mt-17">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Riwayat Submission Saya</h1>
              <p className="text-gray-600">Lihat semua submission yang telah Anda kirim</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FiClock className="text-gray-400" />
              <span>Total: {submissions.length} submission</span>
            </div>
            {userNik && (
              <div className="flex items-center gap-1">
                <FiUsers className="text-gray-400" />
                <span>NIK: {userNik}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FiFileText className="text-6xl mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum ada submission</h3>
              <p className="text-gray-500">Anda belum mengirimkan submission untuk form ini</p>
              <button
                onClick={() => router.push(`/forms/${formId}/user`)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Isi Form Sekarang
              </button>
            </div>
          ) : (
            submissions.map((submission, index) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/forms/${formId}/user-responses/${submission.nik}?sequence=${submission.sequence}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                      #{submission.sequence}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Submission #{submission.sequence}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <FiClock className="text-gray-400" />
                          <span>
                            {new Date(submission.created_time || Date.now()).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>                        
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/forms/${formId}/edit-submission/${submission.id}`)
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                    >
                      <FiEdit className="w-3 h-3" />
                      Edit Form
                    </button>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="text-sm font-medium">Lihat Detail</span>
                      <FiArrowRight className="text-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 