'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Question, Category, Section, QuestionType } from '@/types'
import { updateQuestion, getAllSections } from '@/lib/api'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

interface Props {
  formId: string
  question: Question
  categories: Category[]
  sections: Section[]
  types: QuestionType[]
  onClose: () => void
  onUpdated: (updatedQuestion: Question) => void
}

export default function EditQuestionModal({
  formId,
  question,
  categories,
  sections,
  types,
  onClose,
  onUpdated,
}: Props) {
  const [visible, setVisible] = useState(false)

  const [title, setTitle] = useState(question.title || '')
  const [description, setDescription] = useState(question.description || '')
  const [comment, setComment] = useState(question.comment || '')
  const [mandatory, setMandatory] = useState(question.mandatory || false)
  const [categoryId, setCategoryId] = useState((question.category as any)?.id || '')
  const [sectionId, setSectionId] = useState(question.section?.id || '')
  const [typeId, setTypeId] = useState((question.type as any)?.questionTypeId || '')
  const [allSections, setAllSections] = useState<Section[]>([])

  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
  }, [])

  // Fetch all available sections
  useEffect(() => {
    async function fetchAllSections() {
      try {
        console.log('Fetching all sections for edit...')
        const sections = await getAllSections()
        console.log('Successfully fetched all sections for edit:', sections.length, 'sections')
        setAllSections(sections)
        console.log('Fetched all sections for edit dropdown:', sections.map(s => ({ id: s.id, title: s.title, section: s.section })))
      } catch (err) {
        console.error('Failed to fetch all sections:', err)
        toast.error('Gagal memuat semua sections')
      }
    }
    fetchAllSections()
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose(), 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        form_id: formId,
        title,
        description,
        comment,
        mandatory,
        category_id: categoryId,
        section_id: sectionId,
        type_id: typeId,
      }
      const updated = await updateQuestion(question.questionId, payload)
      toast.success('Pertanyaan berhasil diupdate!')
      onUpdated(updated)
      router.refresh()
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengupdate pertanyaan')
      console.error('Gagal mengupdate pertanyaan', err)
    }
  }

  return (
    <Dialog open={true} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        className={`fixed inset-0 transition-opacity backdrop-blur-sm ${
          visible ? 'bg-gray-500/75 opacity-100' : 'bg-gray-500/0 opacity-0'
        }`}
      />

      <div className="fixed inset-0 flex items-center justify-center px-4 z-50">
        <DialogPanel
          className={`bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg transform transition-all duration-200 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-semibold text-gray-800">
                Edit Pertanyaan
              </DialogTitle>
              <button type="button" onClick={handleClose}>
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="text-sm text-gray-700">Judul Pertanyaan</span>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Deskripsi</span>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Komentar</span>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Kategori</span>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Section</span>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  required
                >
                  <option value="">Pilih section ({allSections.length} sections tersedia)</option>
                  {allSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title || sec.section}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Tipe Pertanyaan</span>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                >
                  <option value="">Pilih tipe</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Wajib Diisi</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
