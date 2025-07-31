'use client'

import { useState } from 'react'
import { FiDownload, FiMail, FiX, FiCheck } from 'react-icons/fi'

interface ExportCSVModalProps {
  isOpen: boolean
  onClose: () => void
  onExportBrowser: () => void
  onExportEmail: (email: string) => void
  exporting: boolean
  isEmailExporting?: boolean
}

export default function ExportCSVModal({ 
  isOpen, 
  onClose, 
  onExportBrowser, 
  onExportEmail, 
  exporting,
  isEmailExporting = false
}: ExportCSVModalProps) {
  const [selectedOption, setSelectedOption] = useState<'browser' | 'email'>('browser')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  if (!isOpen) return null

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setEmailError('')
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = () => {
    if (selectedOption === 'email') {
      if (!email.trim()) {
        setEmailError('Email harus diisi')
        return
      }
      if (!validateEmail(email)) {
        setEmailError('Format email tidak valid')
        return
      }
      onExportEmail(email)
    } else {
      onExportBrowser()
    }
  }

  const handleClose = () => {
    setSelectedOption('browser')
    setEmail('')
    setEmailError('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px) saturate(200%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(200%) brightness(0.8)'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiDownload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Export CSV
              </h3>
              <p className="text-sm text-gray-500">
                Pilih cara export data
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            {/* Browser Download Option */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedOption === 'browser'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedOption('browser')}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedOption === 'browser' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <FiDownload className={`w-5 h-5 ${
                    selectedOption === 'browser' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    selectedOption === 'browser' ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    Download via Browser
                  </h4>
                  <p className={`text-sm ${
                    selectedOption === 'browser' ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    File CSV akan langsung terdownload
                  </p>
                </div>
                {selectedOption === 'browser' && (
                  <FiCheck className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>

            {/* Email Option */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedOption === 'email'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedOption('email')}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedOption === 'email' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FiMail className={`w-5 h-5 ${
                    selectedOption === 'email' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    selectedOption === 'email' ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    Kirim via Email
                  </h4>
                  <p className={`text-sm ${
                    selectedOption === 'email' ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    File CSV akan dikirim ke email Anda (proses di background)
                  </p>
                </div>
                {selectedOption === 'email' && (
                  <FiCheck className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>

            {/* Email Input */}
            {selectedOption === 'email' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
                <p className="text-xs text-gray-500">
                  ⚡ Proses export akan berjalan di background, Anda dapat melanjutkan aktivitas lain
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={exporting}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={exporting || (selectedOption === 'email' && !email.trim())}
            className={`px-4 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedOption === 'browser' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {exporting && selectedOption === 'browser' ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Downloading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {selectedOption === 'browser' ? (
                  <>
                    <FiDownload className="w-4 h-4" />
                    <span>Download</span>
                  </>
                ) : (
                  <>
                    <FiMail className="w-4 h-4" />
                    <span>Kirim Email</span>
                  </>
                )}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 