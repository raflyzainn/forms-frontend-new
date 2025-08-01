'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { STATIC_QUESTION_TYPES } from '@/lib/staticTypes'
import { updateQuestion, getAllSections, createChoice, deleteChoice, getCategories } from '@/lib/api'
import { Category, Section, Question } from '@/types'

interface Props {
  question: Question
  formId: string
  categories: Category[]
  sections: Section[]
  onCancel: () => void
  onSuccess: (updatedQuestion: Question) => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
}

export default function EditQuestionForm({
  question,
  formId,
  categories,
  sections,
  onCancel,
  onSuccess,
  isSubmitting,
  setIsSubmitting
}: Props) {
  // State untuk form pertanyaan
  const [editedQuestion, setEditedQuestion] = useState({
    title: question.title || '',
    description: question.description || '',
    comment: question.comment || '',
    typeId: question.type?.type || '',
    categoryId: (question.category as any)?.id || '',
    sectionId: question.section?.id || '',
    isMandatory: question.mandatory || false
  })
  
  // State untuk pilihan (choices)
  const [allChoices, setAllChoices] = useState<{ id: string, title: string }[]>([])
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([])
  const [newChoiceTitle, setNewChoiceTitle] = useState('')
  const [addingChoice, setAddingChoice] = useState(false)
  const [allSections, setAllSections] = useState<Section[]>([])
  const [choiceCategories, setChoiceCategories] = useState<Category[]>([])
  
  // State untuk choice category
  const [choiceCategoryId, setChoiceCategoryId] = useState('')

  // Cek apakah tipe pertanyaan yang dipilih adalah tipe choice
  const selectedType = STATIC_QUESTION_TYPES.find((type) => type.id === editedQuestion.typeId);
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

  // Set selected choices dari question yang ada
  useEffect(() => {
    if (question.choices && question.choices.length > 0) {
      const choiceIds = question.choices.map(choice => choice.choiceId);
      setSelectedChoiceIds(choiceIds);
    }
  }, [question.choices]);

  // Fetch all available sections and choice categories
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('EditQuestionForm: Fetching all sections...')
        const sections = await getAllSections()
        console.log('EditQuestionForm: Successfully fetched all sections:', sections.length, 'sections')
        setAllSections(sections)
        console.log('EditQuestionForm: Fetched all sections for dropdown:', sections.map(s => ({ id: s.id, title: s.title, section: s.section })))
        
        console.log('EditQuestionForm: Fetching choice categories...')
        const choiceCats = await getCategories()
        console.log('EditQuestionForm: Successfully fetched choice categories:', choiceCats.length, 'categories')
        setChoiceCategories(choiceCats)
      } catch (err) {
        console.error('EditQuestionForm: Failed to fetch data:', err)
        toast.error('Gagal memuat data')
      }
    }
    fetchData()
  }, [])

  // Fungsi untuk menambah choice baru
  const handleAddChoice = async () => {
    if (!newChoiceTitle.trim()) {
      toast.error('Judul pilihan tidak boleh kosong');
      return;
    }
    
    if (!choiceCategoryId) {
      toast.error('Harap pilih kategori pilihan terlebih dahulu sebelum menambah pilihan');
      return;
    }
    
    setAddingChoice(true);
    try {
      // Menggunakan API baru dengan category_id
      const newChoice = await createChoice({
        category_id: choiceCategoryId,
        title: newChoiceTitle,
        description: '',
        comment: ''
      });
      
      setAllChoices(prev => [...prev, newChoice.data]);
      setSelectedChoiceIds(prev => [...prev, newChoice.data.id]);
      setNewChoiceTitle('');
      toast.success('Pilihan berhasil ditambahkan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan pilihan');
    } finally {
      setAddingChoice(false);
    }
  };

  const handleDeleteChoice = async (choiceId: string) => {
    try {
      await deleteChoice(choiceId);
      setAllChoices(prev => prev.filter(choice => choice.id !== choiceId));
      setSelectedChoiceIds(prev => prev.filter(id => id !== choiceId));
      toast.success('Pilihan berhasil dihapus');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus pilihan');
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

  // Handle submitting updated question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editedQuestion.title || !editedQuestion.typeId || !editedQuestion.categoryId || !editedQuestion.sectionId) {
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
      const selectedType = STATIC_QUESTION_TYPES.find(type => type.id === editedQuestion.typeId);
      const selectedCategory = categories.find(cat => cat.id === editedQuestion.categoryId);
      const selectedSection = sections.find(sec => sec.id === editedQuestion.sectionId);
      
      // Buat payload untuk API updateQuestion
      const payload = {
        form_id: formId,
        type_id: selectedType ? selectedType.id : editedQuestion.typeId,
        category_id: editedQuestion.categoryId,
        section_id: editedQuestion.sectionId,
        title: editedQuestion.title,
        description: editedQuestion.description,
        comment: editedQuestion.comment,
        is_mandatory: editedQuestion.isMandatory
      };
      
      // Update pertanyaan
      const updatedQuestion = await updateQuestion(question.questionId, payload);
      
      // Jika tipe pertanyaan adalah choice, update choices mapping
      if (isChoiceType && selectedChoiceIds.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${question.questionId}/choices/map`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice_ids: selectedChoiceIds }),
        });
      }
      
      // Buat objek pertanyaan yang diupdate untuk ditambahkan ke state
      const updatedQ: Question = {
        questionId: question.questionId,
        form_id: formId,
        title: editedQuestion.title,
        description: editedQuestion.description,
        comment: editedQuestion.comment,
        category: {
          category: selectedCategory?.category || ''
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
        mandatory: editedQuestion.isMandatory,
        choices: isChoiceType ? selectedChoiceIds.map(id => {
          const choice = allChoices.find(c => c.id === id);
          return choice ? { choiceId: id, title: choice.title } : { choiceId: id, title: '' };
        }) : []
      };
      
      toast.success('Pertanyaan berhasil diupdate!');
      onSuccess(updatedQ);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengupdate pertanyaan');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border-2 border-blue-400 shadow-lg mt-4 relative transition-all duration-300 ease-in-out max-w-4xl mx-auto">
      <form onSubmit={handleSubmitQuestion} className="space-y-5 p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200">
          <h3 className="text-xl font-medium text-gray-800">Edit Pertanyaan</h3>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            
          </button>
        </div>
        
        <div className="border-b border-gray-200 pb-4 focus-within:border-blue-500 transition-colors">
          <input
            type="text"
            value={editedQuestion.title}
            onChange={(e) => setEditedQuestion({...editedQuestion, title: e.target.value})}
            placeholder="Pertanyaan"
            required
            className="w-full border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 px-0 py-2 text-lg placeholder-gray-400 focus:outline-none"
          />

          <textarea
            value={editedQuestion.description}
            onChange={(e) => setEditedQuestion({...editedQuestion, description: e.target.value})}
            placeholder="Deskripsi (Opsional)"
            className="w-full border-0 focus:ring-0 px-0 py-2 text-sm placeholder-gray-400 focus:outline-none mt-2"
          />
        </div>

        <div className="pt-2 focus-within:border-blue-500 transition-colors">
          <input
            value={editedQuestion.comment}
            onChange={(e) => setEditedQuestion({...editedQuestion, comment: e.target.value})}
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
              value={editedQuestion.typeId}
              onChange={(e) => setEditedQuestion({...editedQuestion, typeId: e.target.value})}
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
              value={editedQuestion.categoryId}
              onChange={(e) => setEditedQuestion({...editedQuestion, categoryId: e.target.value})}
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
              value={editedQuestion.sectionId}
              onChange={(e) => setEditedQuestion({...editedQuestion, sectionId: e.target.value})}
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
                  <div key={choice.id} className="flex items-center justify-between">
                    <div className="flex items-center">
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
                    <button
                      type="button"
                      onClick={() => handleDeleteChoice(choice.id)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Hapus pilihan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Form untuk menambah pilihan baru */}
            <div className="mt-3 border-t border-gray-200 pt-3">
              {/* Dropdown untuk choice category */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori Pilihan</label>
                <select
                  value={choiceCategoryId}
                  onChange={(e) => setChoiceCategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-0 text-sm"
                >
                  <option value="">Pilih Kategori Pilihan</option>
                  {choiceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>
              
              {!choiceCategoryId && (
                <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  ⚠️ Pilih kategori pilihan terlebih dahulu sebelum menambah pilihan baru
                </div>
              )}
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
                  disabled={addingChoice || !newChoiceTitle.trim() || !choiceCategoryId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium transition-colors"
                  title={!choiceCategoryId ? 'Pilih kategori pilihan terlebih dahulu' : ''}
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
              checked={editedQuestion.isMandatory}
              onChange={() => setEditedQuestion({...editedQuestion, isMandatory: !editedQuestion.isMandatory})}
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
              {isSubmitting ? 'Menyimpan...' : 'Update'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 