'use client'

import { useState } from 'react'
import { Category, Section } from '@/types'
import { updateSection } from '@/lib/api'
import { Dialog } from '@headlessui/react'
import { Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'


interface Props {
  section: Section
  categories: Category[]
  onClose: () => void
  onUpdated: (updated: Section) => void
}

export default function EditSectionModal({ section, categories, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(section.title || '')
  const [sectionName, setSectionName] = useState(section.section || '')
  const [description, setDescription] = useState(section.description || '')
  const [categoryId, setCategoryId] = useState(section.category_id)
  const [loading, setLoading] = useState(false)


  const router = useRouter()

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const updated = await updateSection(section.id, {
        title,
        section: sectionName,
        description,
        category_id: categoryId
      })
      onUpdated(updated)
      onClose()
      toast.success('Section berhasil diupdate!')
      router.replace(router.asPath)
    } catch (err: any) {
      console.error('Gagal update section', err)
      toast.error(err.message || 'Gagal menyimpan perubahan.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Transition appear show as={Dialog} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <Transition.Child
          enter="transition duration-300 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition duration-200 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="bg-white rounded-md shadow-lg p-6 w-full max-w-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">Edit Section</Dialog.Title>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Judul Section</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Kode Section</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Transition>
  )
}
