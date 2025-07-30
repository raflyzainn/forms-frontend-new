'use client'

import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react'
import { createCategory } from '@/lib/api'
import { Category } from '@/types'
import { toast } from 'react-toastify'

interface Props {
  onClose: () => void
  onCreated: (newCategory: Category) => void
}

export default function AddCategoryModal({ onClose, onCreated }: Props) {
  const [visible, setVisible] = useState(false)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category.trim() || !title.trim()) {
      setError('Kategori dan judul wajib diisi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newCategory = await createCategory({ category, title, description })
      onCreated(newCategory)
      toast.success('Cateogry berhasil dibuat!')
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Gagal membuat kategori')
      toast.error(err.message || 'Gagal membuat kategori')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200">
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">Tambah Kategori</h2>
        <p className="text-sm text-gray-600 text-center mb-4">Masukkan informasi lengkap kategori baru</p>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Kategori (contoh: Business, Market)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Judul Kategori"
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
              {loading ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
