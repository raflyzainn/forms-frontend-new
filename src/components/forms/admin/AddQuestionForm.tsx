'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { STATIC_QUESTION_TYPES } from '@/lib/staticTypes'
import { createQuestion, getAllSections } from '@/lib/api'
import { Category, Section } from '@/types'

interface Props {
  formId: string
  categories: Category[]
  sections: Section[]
  onCancel: () => void
  onSuccess: (newQuestion: any) => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
}

export default function AddQuestionForm({
  formId,
  categories,
  sections,
  onCancel,
  onSuccess,
  isSubmitting,
  setIsSubmitting
}: Props) {
  // State untuk form pertanyaan
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    comment: '',
    typeId: '',
    categoryId: '',
    sectionId: '',
    isMandatory: false
  })
  
  // State untuk pilihan (choices)
  const [allChoices, setAllChoices] = useState<{ id: string, title: string }[]>([])
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([])
  const [newChoiceTitle, setNewChoiceTitle] = useState('')
  const [addingChoice, setAddingChoice] = useState(false)
  const [allSections, setAllSections] = useState<Section[]>([])

  // Cek apakah tipe pertanyaan yang dipilih adalah tipe choice
  const selectedType = STATIC_QUESTION_TYPES.find((type) => type.id === newQuestion.typeId);
  const isChoiceType = ["3", "4", "5", "6"].includes(selectedType?.type || "");
  
  // Ambil data choices ketika tipe pertanyaan adalah choice
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
        console.log('AddQuestionForm: Fetching all sections...')
        const sections = await getAllSections()
        console.log('AddQuestionForm: Successfully fetched all sections:', sections.length, 'sections')
        setAllSections(sections)
        console.log('AddQuestionForm: Fetched all sections for dropdown:', sections.map(s => ({ id: s.id, title: s.title, section: s.section })))
      } catch (err) {
        console.error('AddQuestionForm: Failed to fetch all sections:', err)
        toast.error('Gagal memuat semua sections')
      }
    }
    fetchAllSections()
  }, [])

  // Fungsi untuk menambah choice baru
  const handleAddChoice = async () => {
    if (!newChoiceTitle.trim()) {
      toast.error('Judul pilihan tidak boleh kosong');
      return;
    }
    
    setAddingChoice(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/choices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newChoiceTitle }),
      });
      
      if (!response.ok) throw new Error('Gagal menambahkan pilihan');
      
      const newChoice = await response.json();
      setAllChoices(prev => [...prev, newChoice]);
      setSelectedChoiceIds(prev => [...prev, newChoice.id]);
      setNewChoiceTitle('');
      toast.success('Pilihan berhasil ditambahkan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan pilihan');
    } finally {
      setAddingChoice(false);
    }
  };
  
  // Fungsi untuk menangani perubahan pilihan choice
  const handleChoiceChange = (choiceId: string) => {
    // Semua tipe choice bisa memilih multiple choices untuk ditambahkan ke soal
    setSelectedChoiceIds(prev => 
      prev.includes(choiceId)
        ? prev.filter(id => id !== choiceId)
        : [...prev, choiceId]
    );
  };

  // Handle submitting a new question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newQuestion.title || !newQuestion.typeId || !newQuestion.categoryId || !newQuestion.sectionId) {
      toast.error('Harap isi semua field yang diperlukan')
      return
    }
    
    // Validasi choices untuk tipe pertanyaan choice
    if (isChoiceType && selectedChoiceIds.length === 0) {
      toast.error('Pilihan wajib dipilih untuk tipe pertanyaan ini');
      return;
    }

    // Validasi minimal 2 choices untuk single choice types
    if ((selectedType?.type === "3" || selectedType?.type === "4") && selectedChoiceIds.length < 2) {
      toast.error('Untuk tipe Single Choice, minimal harus ada 2 pilihan');
      return;
    }

    setIsSubmitting(true)

    try {
      const selectedType = STATIC_QUESTION_TYPES.find(type => type.id === newQuestion.typeId);
      const selectedCategory = categories.find(cat => cat.id === newQuestion.categoryId);
      const selectedSection = sections.find(sec => sec.id === newQuestion.sectionId);
      
      // Buat payload untuk API createQuestion
      const payload = {
        form_id: formId,
        type_id: selectedType ? selectedType.id : newQuestion.typeId,
        category_id: newQuestion.categoryId,
        section_id: newQuestion.sectionId,
        title: newQuestion.title,
        description: newQuestion.description,
        comment: newQuestion.comment,
        is_mandatory: newQuestion.isMandatory
      };
      
      // Buat pertanyaan terlebih dahulu
      const question = await createQuestion(payload);
      
      // Jika tipe pertanyaan adalah choice, map choices ke pertanyaan
      if (isChoiceType && selectedChoiceIds.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${question.questionId}/choices/map`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice_ids: selectedChoiceIds }),
        });
      }
      
      // Buat objek pertanyaan baru untuk ditambahkan ke state
      const newQ = {
        questionId: question.questionId || question.id,
        title: newQuestion.title,
        description: newQuestion.description,
        comment: newQuestion.comment,
        category: {
          id: selectedCategory?.id || '',
          name: selectedCategory?.category || ''
        },
        section: selectedSection ? {
          id: selectedSection.id,
          title: selectedSection.title || selectedSection.section || '',
          description: selectedSection.description
        } : undefined,
        type: {
          type: selectedType?.type || '',
          name: selectedType?.name || ''
        },
        mandatory: newQuestion.isMandatory,
        choices: isChoiceType ? selectedChoiceIds.map(id => {
          const choice = allChoices.find(c => c.id === id);
          return choice ? { id, title: choice.title } : { id, title: '' };
        }) : []
      };
      
      toast.success('Pertanyaan berhasil dibuat!');
      onSuccess(newQ);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat pertanyaan');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border-2 border-blue-400 shadow-lg mt-4 relative transition-all duration-300 ease-in-out max-w-4xl mx-auto">
      <form onSubmit={handleSubmitQuestion} className="space-y-5 p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200">
          <h3 className="text-xl font-medium text-gray-800">Tambah Pertanyaan Baru</h3>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="border-b border-gray-200 pb-4 focus-within:border-blue-500 transition-colors">
          <input
            type="text"
            value={newQuestion.title}
            onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
            placeholder="Pertanyaan"
            required
            className="w-full border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 px-0 py-2 text-lg placeholder-gray-400 focus:outline-none"
          />

          <textarea
            value={newQuestion.description}
            onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
            placeholder="Deskripsi (Opsional)"
            className="w-full border-0 focus:ring-0 px-0 py-2 text-sm placeholder-gray-400 focus:outline-none mt-2"
          />
        </div>

        <div className="pt-2 focus-within:border-blue-500 transition-colors">
          <input
            value={newQuestion.comment}
            onChange={(e) => setNewQuestion({...newQuestion, comment: e.target.value})}
            placeholder="Komentar (Opsional)"
            className="w-full border-0 border-b border-gray-200 focus:border-blue-500 focus:ring-0 px-0 py-2 text-sm placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 bg-gray-50 p-4 rounded-md">
          <div>
            <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 mb-1">Tipe Pertanyaan</label>
            <select
              id="typeId"
              required
              value={newQuestion.typeId}
              onChange={(e) => setNewQuestion({...newQuestion, typeId: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-0 bg-white shadow-sm"
            >
              <option value="">Pilih Tipe</option>
              {STATIC_QUESTION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              id="categoryId"
              required
              value={newQuestion.categoryId}
              onChange={(e) => setNewQuestion({...newQuestion, categoryId: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-0 bg-white shadow-sm"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              id="sectionId"
              required
              value={newQuestion.sectionId}
              onChange={(e) => setNewQuestion({...newQuestion, sectionId: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-0 bg-white shadow-sm"
            >
              <option value="">Pilih Section ({allSections.length} sections tersedia)</option>
              {allSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.title || sec.section}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Bagian pilihan (choices) untuk tipe pertanyaan choice */}
        {isChoiceType && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Pilihan</h4>
            <p className="text-xs text-gray-600 mb-3">
              {selectedType?.type === "3" || selectedType?.type === "4" 
                ? "Pilih minimal 2 pilihan untuk Single Choice" 
                : "Pilih pilihan yang akan ditampilkan untuk Multiple Choice"}
            </p>
            
            {/* Daftar pilihan yang tersedia */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  Dipilih: {selectedChoiceIds.length} dari {allChoices.length} pilihan
                </span>
              </div>
              {allChoices.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Belum ada pilihan tersedia</p>
              ) : (
                allChoices.map((choice) => (
                  <div key={choice.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`choice-${choice.id}`}
                      name="choice-options"
                      checked={selectedChoiceIds.includes(choice.id)}
                      onChange={() => handleChoiceChange(choice.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`choice-${choice.id}`} className="ml-2 text-sm text-gray-700">
                      {choice.title}
                    </label>
                  </div>
                ))
              )}
            </div>
            
            {/* Form untuk menambah pilihan baru */}
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newChoiceTitle}
                  onChange={(e) => setNewChoiceTitle(e.target.value)}
                  placeholder="Tambah pilihan baru"
                  className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:border-blue-500 focus:ring-0 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddChoice}
                  disabled={addingChoice || !newChoiceTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium transition-colors"
                >
                  {addingChoice ? 'Menambahkan...' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={newQuestion.isMandatory}
              onChange={() => setNewQuestion({...newQuestion, isMandatory: !newQuestion.isMandatory})}
              className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Wajib diisi</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium transition-colors shadow-sm"
            >
              {isSubmitting ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}