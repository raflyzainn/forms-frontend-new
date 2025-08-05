'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getFormSubmissions, exportFormToCSV, exportFormToCSVEmail } from '@/lib/api'
import { Submission } from '@/types'
import HomepageHeader from '@/components/common/HomepageHeader'
import ExportCSVModal from '@/components/modal/ExportCSVModal'
import { FiUsers, FiClock, FiArrowRight, FiDownload } from 'react-icons/fi'

export default function ResponsesListPage() {
  const router = useRouter()
  const { id: formId } = useParams()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [formId])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const data = await getFormSubmissions(formId as string)
      setSubmissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleExportBrowser = async () => {
    try {
      setExporting(true)
      setError(null)
      await exportFormToCSV(formId as string)
      setShowExportModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleExportEmail = async (email: string) => {
    try {
      setError(null)
      setShowExportModal(false)
      
      exportFormToCSVEmail(formId as string, email)
        .then(() => {
          toast.success('CSV berhasil dikirim ke email Anda!')
        })
        .catch((err) => {
          toast.error(err.message || 'Gagal export CSV via email')
        })
        
    } catch (err) {
      toast.error('Gagal mengirim request export CSV')
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
      <HomepageHeader isAdminPage={true} />
      
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 mt-17">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Daftar Responses</h1>
                <p className="text-gray-600">Lihat semua submission yang telah dikirim</p>
              </div>
            </div>
            
            {submissions.length > 0 && (
              <button
                onClick={() => setShowExportModal(true)}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FiDownload className="text-lg" />
                Export CSV
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FiClock className="text-gray-400" />
              <span>Total: {submissions.length} submission</span>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FiUsers className="text-6xl mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum ada responses</h3>
              <p className="text-gray-500">Form ini belum memiliki submission dari user</p>
            </div>
          ) : (
            submissions.map((submission, index) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/forms/${formId}/responses/${submission.nik}?sequence=${submission.sequence}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                      {submission.nik.slice(-4)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        NIK: {submission.nik}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <FiClock className="text-gray-400" />
                          <span>Submit #{submission.sequence}</span>
                        </div>                        
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="text-sm font-medium">Lihat Detail</span>
                    <FiArrowRight className="text-lg" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ExportCSVModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportBrowser={handleExportBrowser}
        onExportEmail={handleExportEmail}
        exporting={exporting}
        isEmailExporting={false}
      />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
} 