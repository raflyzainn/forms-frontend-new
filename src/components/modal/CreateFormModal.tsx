'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createForm, createTemplateQuestions } from '@/lib/api'
import { Form } from '@/types'
import { TEMPLATE_QUESTIONS } from '@/lib/staticTypes' 

interface Props {
  onClose: () => void
  onCreated: (form: Form) => void
}

export default function CreateFormModal({ onClose, onCreated }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [openedDate, setOpenedDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [deadlineMessage, setDeadlineMessage] = useState('')
  const [useTemplate, setUseTemplate] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const newForm = await createForm({ 
        title, 
        description, 
        comment,
        opened_date: openedDate || undefined,
        deadline: deadline || undefined,
        is_active: isActive,
        deadline_message: deadlineMessage || undefined
      })
      
      // Create template questions if checkbox is checked
      if (useTemplate) {
        console.log('Creating template questions for form:', newForm.id)
        try {
          await createTemplateQuestions(newForm.id, TEMPLATE_QUESTIONS)
          console.log('Template questions created successfully')
        } catch (error) {
          console.error('Failed to create template questions:', error)
          // Don't throw error, just log it - form is still created
        }
      }
      
      onCreated(newForm)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat membuat form.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200 p-4">
      <div
        className={`bg-white rounded-lg w-full max-w-md shadow-lg transform transition-all duration-200 max-h-[90vh] flex flex-col ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">Buat Form Baru</h2>
          <p className="text-sm text-gray-600 text-center">
            Isi informasi di bawah untuk membuat form baru.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Judul Form"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <textarea
            placeholder="Deskripsi (Opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Komentar (Opsional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />

          {/* Deadline Settings */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700">Pengaturan Deadline</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tanggal Dibuka</label>
                <input
                  type="datetime-local"
                  value={openedDate}
                  onChange={(e) => setOpenedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Form aktif
              </label>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Pesan Deadline (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Form akan ditutup pada 15 Februari 2025"
                value={deadlineMessage}
                onChange={(e) => setDeadlineMessage(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Template Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useTemplate"
              checked={useTemplate}
              onChange={(e) => setUseTemplate(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="useTemplate" className="text-sm text-gray-700">
              Gunakan template pertanyaan koperasi
            </label>
          </div>

          {/* Template Preview */}
          {useTemplate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-2">Template yang akan ditambahkan:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Nama Koperasi (Text)</li>
                <li>• Alamat Koperasi (Text)</li>
                <li>• Nomor Telepon (Text)</li>
                <li>• Email (Text)</li>
                <li>• Jenis Koperasi (Single Choice)</li>
                <li>• Sumber Modal (Multiple Choice)</li>
                <li>• Dokumen Pendukung (Document Upload)</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Menyimpan...' : 'Buat'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
