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
    try {
      setLoading(true)
      setError(null)
      
      await deleteCustomURL(form.id, customURLId)
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
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px) saturate(200%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(200%) brightness(0.8)'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Kelola Custom URL
              </h3>
              <p className="text-sm text-gray-500">
                {form.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
              <span className="text-green-700">{success}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Create New Custom URL Form */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Buat Custom URL Baru
            </h4>
            
            <form onSubmit={handleCreateCustomURL}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Hanya huruf kecil, angka, dan tanda hubung
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Redirect
                  </label>
                  <select
                    value={redirectType}
                    onChange={(e) => setRedirectType(e.target.value as 'user' | 'admin')}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={loading}
                  >
                    <option value="user">User Form</option>
                    <option value="admin">Admin Panel</option>
                  </select>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading || !customSlug.trim()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? 'Membuat...' : 'Buat Custom URL'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Existing Custom URLs */}
          {form.custom_urls && form.custom_urls.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Custom URL yang Tersedia ({form.custom_urls.length})
              </h4>
              
              <div className="space-y-3">
                {form.custom_urls.map((customURL) => (
                  <div
                    key={customURL.id}
                    className="p-4 border border-gray-200 rounded hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            /{customURL.custom_slug}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            customURL.redirect_type === 'user' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {customURL.redirect_type === 'user' ? 'User' : 'Admin'}
                          </span>
                          {customURL.is_active && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              Aktif
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {window.location.origin}/{customURL.custom_slug}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Token: {customURL.form_token}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/${customURL.custom_slug}`)}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
                        >
                          Salin
                        </button>
                        <button
                          onClick={() => handleDeleteCustomURL(customURL.id)}
                          disabled={loading}
                          className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                        >
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
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada custom URL yang dibuat</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
} 