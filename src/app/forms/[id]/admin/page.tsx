'use client'

import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify';
import { useParams, usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

import FormHeader from '@/components/forms/FormHeader'
import FormQuestionGroupAdmin from '@/components/forms/admin/QuestionGroupAdmin'
import { useFetchFormData } from '@/components/fetch/useFetchFormData'
import HomepageHeader from '@/components/common/HomepageHeader'
import AddQuestionForm from '@/components/forms/admin/AddQuestionForm'

import AddSectionModal from '@/components/modal/AddSectionModal'
import AddCategoryModal from '@/components/modal/AddCategoryModal'
import EditSectionModal from '@/components/modal/EditSectionModal'

import { STATIC_QUESTION_TYPES } from '@/lib/staticTypes'
import { deleteForm, updateForm, deleteQuestion, getCategories, getSections, reorderQuestions, reorderSections, reorderChoices, deleteSection, copyQuestion } from '@/lib/api'
import { Category, Section, Question, QuestionType, Choice, Form } from '@/types'
import { QuestionTypeName } from '@/types/enum'
import { getFormStatus } from '@/lib/formUtils'

export default function FormPage() {
  const { id: formId } = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const isFillPage = pathname.includes('/fill')
  const { title, description, comment, questions: initialQuestions, loading, refresh: refreshFormData } = useFetchFormData(formId as string)

  const [categories, setCategories] = useState<Category[]>([])
  const [sections, setSections] = useState<Section[]>([]) 
  const [questions, setQuestions] = useState<Question[]>([])
  const [form, setForm] = useState<Form | null>(null)
  const [showAddSection, setShowAddSection] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [deletingSections, setDeletingSections] = useState<Record<string, boolean>>({})
  
  // State untuk inline question editor
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [addingQuestionAfterIndex, setAddingQuestionAfterIndex] = useState<number | null>(null)
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
  const newQuestionRef = useRef<HTMLDivElement>(null)
  
  // State untuk inline editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  useEffect(() => {
    console.log('Initial questions changed:', initialQuestions)
    console.log('Questions length:', initialQuestions?.length || 0)
    setQuestions(initialQuestions || [])
  }, [initialQuestions])

  // Load saved question order from localStorage
  useEffect(() => {
    if (formId) {
      const savedOrder = localStorage.getItem(`form-${formId}-questions-order`)
      if (savedOrder && initialQuestions) {
        try {
          const savedQuestions = JSON.parse(savedOrder)
          // Only apply saved order if we have the same questions
          if (savedQuestions.length === initialQuestions.length) {
            setQuestions(savedQuestions)
          }
        } catch (error) {
          console.error('Error loading saved question order:', error)
        }
      }
    }
  }, [formId, initialQuestions])
  
  // Scroll to new question form when it appears
  useEffect(() => {
    if (isAddingQuestion && newQuestionRef.current) {
      newQuestionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isAddingQuestion])

  // Fetch form data for deadline status
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token')
        if (!token) {
          router.push('/')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const formData = await response.json()
          setForm(formData)
        }
      } catch (error) {
        console.error('Error fetching form data:', error)
      }
    }

    if (formId) {
      fetchFormData()
    }
  }, [formId, router])

  const handleDeleteSection = async (sectionId: string) => {
    setDeletingSections(prev => ({...prev, [sectionId]: true}));
  
    try {
      const sectionQuestions = questions.filter(q => q.section?.id === sectionId);
  
      const deleteResults = await Promise.allSettled(
        sectionQuestions.map(q => deleteQuestion(q.questionId))
      );
  
      await deleteSection(sectionId);
  
      setQuestions(prev => prev.filter(q => q.section?.id !== sectionId));
      setSections(prev => prev.filter(s => s.id !== sectionId));
  
      const successfulDeletes = deleteResults.filter(r => r.status === 'fulfilled');
      if (sectionQuestions.length > 0) {
        toast.success(
          `Berhasil menghapus section dan ${successfulDeletes.length}/${sectionQuestions.length} pertanyaan`
        );
      } else {
        toast.success('Berhasil menghapus section');
      }
      router.refresh();
  
    } catch (err) {
      console.error('Section deletion failed:', err);
      toast.error('Gagal menghapus section');
    } finally {
      setDeletingSections(prev => ({...prev, [sectionId]: false}));
    }
  };
  
  // Handle adding a new question inline
  const handleAddQuestion = (afterIndex: number | null = null) => {
    setIsAddingQuestion(true)
    setAddingQuestionAfterIndex(afterIndex)
  }
  
  // Handle successful question creation
  const handleQuestionSuccess = (newQuestion: any) => {
    setQuestions(prev => [...prev, newQuestion])
    setIsAddingQuestion(false)
    setAddingQuestionAfterIndex(null)
    toast.success('Pertanyaan berhasil ditambahkan')
  }

  // Handle question reordering
  const handleReorderQuestions = async (newQuestions: Question[]) => {
    try {
      // Update UI immediately for better UX
      setQuestions(newQuestions)
      
      // Extract question IDs in the new order as objects with id field
      const questionOrder = newQuestions.map((q, index) => ({
        id: q.questionId,
        order_sequence: index + 1
      }))
      
      console.log('Sending reorder request:', { formId, questionOrder })
      
      // Call backend API to save the new order
      await reorderQuestions(formId as string, questionOrder)
      
      // Save to localStorage as backup
      localStorage.setItem(`form-${formId}-questions-order`, JSON.stringify(newQuestions))
      
      toast.success('Urutan pertanyaan berhasil disimpan')
    } catch (error) {
      console.error('Failed to reorder questions:', error)
      
      let errorMessage = 'Gagal menyimpan urutan pertanyaan'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      
      // Revert to original order on error
      setQuestions(initialQuestions || [])
    }
  }

  // Handle section reordering
  const handleReorderSections = async (newSections: Section[]) => {
    try {
      // Update UI immediately
      setSections(newSections)
      
      // Only call API for sections that actually changed position
      const changedSections = newSections.filter((section, newIndex) => {
        const oldIndex = sections.findIndex(s => s.id === section.id)
        return oldIndex !== newIndex
      })
      
      if (changedSections.length > 0) {
        console.log('Sending section reorder requests for:', changedSections.length, 'sections')
        
        // Call API for each changed section with new order
        const reorderPromises = changedSections.map((section, index) => {
          const newIndex = newSections.findIndex(s => s.id === section.id)
          return reorderSections(formId as string, section.id, newIndex + 1)
        })
        
        await Promise.all(reorderPromises)
        toast.success('Urutan section berhasil disimpan')
      }
    } catch (error) {
      console.error('Failed to reorder sections:', error)
      
      let errorMessage = 'Gagal menyimpan urutan section'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      
      // Revert to original order on error
      setSections(sections)
    }
  }

  // Handle choice reordering
  const handleReorderChoices = async (questionId: string, newChoices: Choice[]) => {
    try {
      console.log('Reordering choices for question:', questionId, newChoices)
      
      // Update local state first for immediate UI feedback
      setQuestions(prev => prev.map(q => {
        if (q.questionId === questionId) {
          return {
            ...q,
            choices: newChoices.map(choice => ({
              choiceId: choice.choice_id,
              title: choice.title || ''
            }))
          }
        }
        return q
      }))
      
      // Call API for each choice with new order
      const reorderPromises = newChoices.map((choice, index) => {
        return reorderChoices(questionId, choice.choice_id, index + 1)
      })
      
      await Promise.all(reorderPromises)
      toast.success('Urutan choices berhasil disimpan')
    } catch (error) {
      console.error('Failed to reorder choices:', error)
      toast.error('Gagal menyimpan urutan choices')
      
      // Revert local state on error
      router.refresh()
    }
  }

  // Handle inline editing
  const handleEditQuestion = (questionId: string) => {
    setEditingQuestionId(questionId)
  }
  
  // Handle successful question update
  const handleQuestionUpdateSuccess = (updatedQuestion: Question) => {
    setQuestions(prev => prev.map(q => 
      q.questionId === updatedQuestion.questionId ? updatedQuestion : q
    ))
    setEditingQuestionId(null)
    router.refresh()
  }

  const handleDeleteQuestion = async (questionId: string) => {
    console.log('handleDeleteQuestion called with:', questionId);
    try {
      await deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.questionId !== questionId));
      toast.success('Berhasil menghapus pertanyaan');
      // Remove router.refresh() to avoid conflicts with state management
    } catch (err) {
      console.error('Failed to delete question:', err);
      
      // Handle different types of errors
      let errorMessage = 'Gagal menghapus pertanyaan';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      // Show more specific error messages
      if (errorMessage.includes('404')) {
        errorMessage = 'Pertanyaan tidak ditemukan';
      } else if (errorMessage.includes('403')) {
        errorMessage = 'Tidak memiliki izin untuk menghapus pertanyaan';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Terjadi kesalahan server';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Koneksi jaringan bermasalah';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleCopyQuestion = async (originalQuestionId: string) => {
    console.log('handleCopyQuestion called for:', originalQuestionId);
    try {
      // Call the API to copy the question
      const result = await copyQuestion(originalQuestionId);
      
      if (result.message === 'Question copied successfully') {
        toast.success('Pertanyaan berhasil disalin!');
        // Refresh the page to show the copied question
        window.location.reload();
      } else {
        toast.error('Gagal menyalin pertanyaan: Response tidak valid');
      }
    } catch (err) {
      console.error('Failed to handle copy question:', err);
      toast.error(err instanceof Error ? err.message : 'Gagal menyalin pertanyaan');
    }
  };

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [fetchedCategories, fetchedSections] = await Promise.all([
          getCategories(),
          getSections(formId as string)
        ])
        console.log('Fetched sections for form:', formId, fetchedSections)
        
        console.log('Fetched sections (already ordered):', fetchedSections)
        setCategories(fetchedCategories)
        setSections(fetchedSections)
      } catch (err) {
        console.error('Failed to fetch initial data:', err)
      }
    }
    fetchInitialData()
  }, [formId])

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto relative">
        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
          <div className="group relative">
            {/* Main FAB */}
            <button 
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-105 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute bottom-14 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pointer-events-auto">
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-1.5 min-w-[140px]">
                {/* Add Question */}
                <button 
                  onClick={() => handleAddQuestion()}
                  className="w-full flex items-center px-3 py-2.5 text-left hover:bg-blue-50 rounded-md transition-colors group/item cursor-pointer"
                >
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2.5 group-hover/item:bg-blue-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 text-sm">Tambah Pertanyaan</div>
                </button>
                
                {/* Add Category */}
                <button 
                  onClick={() => setShowAddCategory(true)}
                  className="w-full flex items-center px-3 py-2.5 text-left hover:bg-green-50 rounded-md transition-colors group/item cursor-pointer"
                >
                  <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2.5 group-hover/item:bg-green-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 text-sm">Tambah Kategori</div>
                </button>
                
                {/* Add Section */}
                <button 
                  onClick={() => setShowAddSection(true)}
                  className="w-full flex items-center px-3 py-2.5 text-left hover:bg-purple-50 rounded-md transition-colors group/item cursor-pointer"
                >
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2.5 group-hover/item:bg-purple-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 text-sm">Tambah Section</div>
                </button>
              </div>
              
              {/* Arrow pointing to FAB */}
              <div className="absolute top-full right-3 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
        <HomepageHeader showResponsesButton={false} />
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 border border-gray-200 mt-8">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                  </div>
                ) : (
                  title || (questions.length > 0 ? 'Form' : 'Form tidak ditemukan')
                )}
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/forms/${formId}/user`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Lihat Form
                </button>
                
                <button
                  onClick={() => router.push(`/forms/${formId}/responses`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Lihat Jawaban
                </button>
              </div>
            </div>
            <p className="mt-3 text-gray-600">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              ) : (
                description || (questions.length > 0 ? 'Form dengan pertanyaan' : '')
              )}
            </p>
            {comment && <p className="mt-2 text-gray-500 text-sm">{comment}</p>}
            
            {/* Form Status */}
            {form && (
              <div className="mt-4">
                {(() => {
                  const formStatus = getFormStatus(form)
                  return (
                    <div className="flex items-center gap-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formStatus.statusColor.replace('text-', 'bg-').replace('-600', '-100')} ${formStatus.statusColor}`}>
                        {formStatus.statusText}
                      </div>
                      {form.deadline && (
                        <div className="text-sm text-gray-600">
                          Deadline: {new Date(form.deadline).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>


        <FormQuestionGroupAdmin
          questions={questions}
          onEditSection={(section) => setEditingSection(section)}
          onDeleteSection={handleDeleteSection}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onCopyQuestion={(questionId) => handleCopyQuestion(questionId)}
          onAddQuestion={handleAddQuestion}
          onReorderQuestions={handleReorderQuestions}
          onReorderSections={handleReorderSections}
          onReorderChoices={handleReorderChoices}
          deletingSections={deletingSections}
          editingQuestionId={editingQuestionId}
          categories={categories}
          sections={sections}
          onQuestionUpdateSuccess={handleQuestionUpdateSuccess}
          isSubmittingEdit={isSubmittingEdit}
          setIsSubmittingEdit={setIsSubmittingEdit}
          formId={formId as string}
        />
        
        {isAddingQuestion && (
          <div ref={newQuestionRef}>
            <AddQuestionForm
              formId={formId as string}
              categories={categories}
              sections={sections}
              onCancel={() => setIsAddingQuestion(false)}
              onSuccess={handleQuestionSuccess}
              isSubmitting={isSubmittingQuestion}
              setIsSubmitting={setIsSubmittingQuestion}
            />
          </div>
        )}
        

      </div>

      {showAddSection && (
        <AddSectionModal
          formId={formId as string}
          onClose={() => setShowAddSection(false)}
          onCreated={(newSection) => setSections((prev) => [...prev, newSection])}
        />
      )}

      {editingSection && (
        <EditSectionModal
          section={editingSection}
          categories={categories}
          onClose={() => setEditingSection(null)}
          onUpdated={(updatedSection) =>
            setSections((prev) =>
              prev.map((s) => (s.id === updatedSection.id ? updatedSection : s))
            )
          }
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onCreated={(newCategory) => setCategories((prev) => [...prev, newCategory])}
        />
      )}






      
    </div>
  )
}
