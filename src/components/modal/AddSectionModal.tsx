'use client'

import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react'
import { createSection, getCategories } from '@/lib/api'
import { Category, Section } from '@/types'
import { toast } from 'react-toastify'

interface Props {
  formId: string
  onClose: () => void
  onCreated: (section: Section) => void
}

export default function AddSectionModal({ formId, onClose, onCreated }: Props) {
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionCode, setSectionCode] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
        if (data.length > 0) setCategoryId(data[0].id)
      } catch (err) {
        console.error(err)
        setError('Failed to load categories')
        toast.error('Gagal memuat kategori')
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const newSection = await createSection({
        category_id: categoryId,
        section: sectionCode,
        title: sectionTitle,
        description,
      })

      onCreated(newSection)
      toast.success('Section berhasil dibuat!')
      handleClose()
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal membuat section'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200">
      
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">Tambah Section</h2>
        <p className="text-sm text-gray-600 text-center mb-4">Isi informasi untuk section ini</p>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Section Code (e.g., A, B, I)"
            value={sectionCode}
            onChange={(e) => setSectionCode(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Section Title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <textarea
            placeholder="Description (optional)"
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}