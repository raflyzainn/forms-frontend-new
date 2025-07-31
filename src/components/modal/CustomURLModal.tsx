'use client'

import { useState, useEffect } from 'react'
import { createCustomURL, deleteCustomURL } from '@/lib/api'
import { CustomURL } from '@/types'
import { FormWithCustomURLs } from '@/types'

interface CustomURLModalProps {
  isOpen: boolean
  onClose: () => void
  form: FormWithCustomURLs
  onUpdate: () => void
}

export default function CustomURLModal({ isOpen, onClose, form, onUpdate }: CustomURLModalProps) {
  const [customSlug, setCustomSlug] = useState('')
  const [redirectType, setRedirectType] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateCustomURL = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customSlug.trim()) {
      setError('Custom slug tidak boleh kosong')
      return
    }

    // Validate custom slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(customSlug)) {
      setError('Custom slug hanya boleh berisi huruf kecil, angka, dan tanda hubung')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await createCustomURL(form.id, {
        custom_slug: customSlug.trim(),
        redirect_type: redirectType
      })

      setSuccess('Custom URL berhasil dibuat!')
      setCustomSlug('')
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat custom URL')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomURL = async (customURLId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus custom URL ini?')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await deleteCustomURL(customURLId)
      setSuccess('Custom URL berhasil dihapus!')
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus custom URL')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('URL berhasil disalin ke clipboard!')
    setTimeout(() => setSuccess(null), 2000)
  }

  useEffect(() => {
    if (success) {
      setTimeout(() => setSuccess(null), 3000)
    }
  }, [success])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomSlug('')
      setRedirectType('user')
      setError(null)
      setSuccess(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Kelola Custom URL
              </h3>
              <p className="text-blue-100 text-sm">
                {form.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">{success}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Create New Custom URL Form */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buat Custom URL Baru
            </h4>
            
            <form onSubmit={handleCreateCustomURL}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Slug
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">/</span>
                    </div>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="survey-kepuasan-2024"
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Hanya huruf kecil, angka, dan tanda hubung
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Redirect
                  </label>
                  <select
                    value={redirectType}
                    onChange={(e) => setRedirectType(e.target.value as 'user' | 'admin')}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                  >
                    <option value="user">👤 User Form</option>
                    <option value="admin">⚙️ Admin Panel</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading || !customSlug.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium inline-flex items-center justify-center h-12"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Membuat...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Buat Custom URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Existing Custom URLs */}
          {form.custom_urls && form.custom_urls.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Custom URL yang Tersedia ({form.custom_urls.length})
                </h4>
              </div>
              
              <div className="divide-y divide-gray-200">
                {form.custom_urls.map((customURL) => (
                  <div
                    key={customURL.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 text-lg">
                              /{customURL.custom_slug}
                            </span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              customURL.redirect_type === 'user' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {customURL.redirect_type === 'user' ? '👤 User' : '⚙️ Admin'}
                            </span>
                          </div>
                          {customURL.is_active && (
                            <span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Aktif
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {window.location.origin}/{customURL.custom_slug}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Token: <span className="font-mono ml-1">{customURL.form_token}</span>
                          </div>
                          
                          {form.deadline_info && (
                            <div className="flex items-center text-xs">
                              <svg className={`w-3 h-3 mr-1 ${form.deadline_info.days_remaining > 0 ? 'text-orange-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className={form.deadline_info.days_remaining > 0 ? 'text-orange-600' : 'text-red-600'}>
                                {form.deadline_info.days_remaining > 0 
                                  ? `${form.deadline_info.days_remaining} hari tersisa`
                                  : 'Deadline telah lewat'
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/${customURL.custom_slug}`)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 h-9"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Salin
                        </button>
                        <button
                          onClick={() => handleDeleteCustomURL(customURL.id)}
                          disabled={loading}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50 h-9"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!form.custom_urls || form.custom_urls.length === 0) && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada Custom URL</h3>
              <p className="text-gray-500 mb-4">Buat custom URL pertama untuk form ini</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
} 