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
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = { ...form, title, description, comment }
    onSave(updated)
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 backdrop-blur-sm ${
        visible ? 'bg-black/30 opacity-100' : 'bg-black/0 opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">Edit Form</h2>
        <p className="text-sm text-gray-600 text-center mb-4">Perbarui informasi form di bawah ini.</p>

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
  )
}
  