'use client'

import { Form } from '@/types'
import { useState, useEffect } from 'react'

interface Props {
  form: Form
  onSave: (updated: Form) => void
  onClose: () => void
}

export default function EditFormModal({ form, onSave, onClose }: Props) {
  const [title, setTitle] = useState(form.title)
  const [description, setDescription] = useState(form.description || '')
  const [comment, setComment] = useState(form.comment || '')
  const [openedDate, setOpenedDate] = useState(form.opened_date || '')
  const [deadline, setDeadline] = useState(form.deadline || '')
  const [isActive, setIsActive] = useState(form.is_active ?? true)
  const [deadlineMessage, setDeadlineMessage] = useState(form.deadline_message || '')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = { 
      ...form, 
      title, 
      description, 
      comment,
      opened_date: openedDate || undefined,
      deadline: deadline || undefined,
      is_active: isActive,
      deadline_message: deadlineMessage || undefined
    }
    onSave(updated)
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 backdrop-blur-sm p-4 ${
        visible ? 'bg-black/30 opacity-100' : 'bg-black/0 opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg w-full max-w-md shadow-lg transform transition-all duration-200 max-h-[90vh] flex flex-col ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">Edit Form</h2>
          <p className="text-sm text-gray-600 text-center">Perbarui informasi form di bawah ini.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
  