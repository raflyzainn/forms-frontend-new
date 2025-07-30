'use client'

import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react'
import { createQuestion, getAllSections } from '@/lib/api'
import { Category, Section } from '@/types/index'
import { STATIC_QUESTION_TYPES } from '@/lib/staticTypes'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid';

interface Props {
  formId: string
  categories: Category[]
  sections: Section[]
  onClose: () => void
  onCreated: () => void
}

export default function AddQuestionModal({
  formId,
  categories,
  sections,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [typeId, setTypeId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [isMandatory, setIsMandatory] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [choices, setChoices] = useState<string[]>(['']);
  const [allChoices, setAllChoices] = useState<{ id: string, title: string }[]>([]);
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([]);
  const [newChoiceTitle, setNewChoiceTitle] = useState('');
  const [addingChoice, setAddingChoice] = useState(false);
  const [allSections, setAllSections] = useState<Section[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const selectedType = STATIC_QUESTION_TYPES.find((type) => type.id === typeId);
  const isChoiceType = ["3", "4", "5", "6"].includes(selectedType?.type || "");

  useEffect(() => {
    if (isChoiceType) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/choices`)
        .then(res => res.json())
        .then(data => setAllChoices(data))
        .catch(err => console.error('Failed to fetch choices', err));
    }
  }, [isChoiceType]);

  // Fetch all available sections
  useEffect(() => {
    async function fetchAllSections() {
      try {
        console.log('Fetching all sections...')
        const sections = await getAllSections()
        console.log('Successfully fetched all sections:', sections.length, 'sections')
        setAllSections(sections)
        console.log('Fetched all sections for dropdown:', sections.map(s => ({ id: s.id, title: s.title, section: s.section })))
      } catch (err) {
        console.error('Failed to fetch all sections:', err)
        toast.error('Gagal memuat semua sections')
      }
    }
    fetchAllSections()
  }, [])

  const handleChoiceChange = (index: number, value: string) => {
    setChoices((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const addChoice = () => setChoices((prev) => [...prev, '']);
  const removeChoice = (index: number) => setChoices((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedType = STATIC_QUESTION_TYPES.find((type) => type.id === typeId);
      const payload = {
        form_id: formId,
        type_id: selectedType ? selectedType.id : typeId, 
        category_id: categoryId,
        section_id: sectionId,
        title,
        description,
        comment,
        is_mandatory: isMandatory,
      };
      console.log('Submitting question payload:', payload);
      const question = await createQuestion(payload);

      if (isChoiceType && selectedChoiceIds.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${question.questionId}/choices/map`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice_ids: selectedChoiceIds }),
        });
      }

      toast.success('Pertanyaan berhasil dibuat!');
      handleClose();
      onCreated();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Gagal membuat pertanyaan');
    }
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-lg shadow-lg transform transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } overflow-y-auto max-h-screen`}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
          Tambah Pertanyaan
        </h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pertanyaan"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi (Opsional)"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Komentar (Opsional)"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              required
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Pilih Tipe</option>
              {STATIC_QUESTION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </select>

            <select
              required
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Pilih Section ({allSections.length} sections tersedia)</option>
              {allSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.title || sec.section}
                </option>
              ))}
            </select>
          </div>

          {isChoiceType && (
            <div className="mt-4">
              <label className="block mb-1 font-semibold">Pilih Pilihan Jawaban</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newChoiceTitle}
                  onChange={(e) => setNewChoiceTitle(e.target.value)}
                  placeholder="Tambah pilihan baru"
                  className="flex-1 border px-2 py-1 rounded"
                  disabled={addingChoice}
                />
                <button
                  type="button"
                  className="text-blue-500"
                  disabled={addingChoice || !newChoiceTitle.trim()}
                  onClick={async () => {
                    setAddingChoice(true);
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/choices`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newChoiceTitle }),
                      });
                      const newChoice = await res.json();
                      setAllChoices((prev) => [...prev, newChoice]);
                      setSelectedChoiceIds((prev) => [...prev, newChoice.id]);
                      setNewChoiceTitle('');
                    } catch (err) {
                      alert('Gagal menambah pilihan');
                    } finally {
                      setAddingChoice(false);
                    }
                  }}
                >
                  Tambah
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded px-2 py-1 bg-white">
                {allChoices.map((choice) => (
                  <div key={choice.id} className="flex gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedChoiceIds.includes(choice.id)}
                      onChange={() => {
                        setSelectedChoiceIds((prev) =>
                          prev.includes(choice.id)
                            ? prev.filter(id => id !== choice.id)
                            : [...prev, choice.id]
                        );
                      }}
                    />
                    <span>{choice.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={() => setIsMandatory(!isMandatory)}
              className="mr-2"
            />
            Wajib diisi
          </label>

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
              Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
