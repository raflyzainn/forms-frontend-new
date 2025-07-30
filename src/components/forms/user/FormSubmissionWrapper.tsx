'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useDebounce } from 'use-debounce';

import FormHeader from '@/components/forms/FormHeader'                    // ← import it here
import FormQuestionGroup from '@/components/forms/user/QuestionGroupUser'
import { STATIC_QUESTION_TYPES } from '@/lib/staticTypes'
import { Question } from '@/types'
import { submitAnswers, uploadDocument, saveFormDraft, getFormDraft, deleteFormDraft, getTempUploads, deleteTempUpload } from '@/lib/api'
interface Props {
  questions: Question[]
  nik: string
  formId: string
  headerProps: {
    title: string
    description?: string | null
    comment?: string | null
  }
}

export default function FormSubmissionWrapper({ questions, nik, formId, headerProps }: Props) {
  const [answers, setAnswers] = useState<
    Record<string, { type: string; answer: any }>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const draftLoadedRef = useRef(false)
  const answersRef = useRef(answers);
  const [debouncedAnswers] = useDebounce(answers, 3000); 
  answersRef.current = answers
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const saveQueueRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    async function loadDraft() {
      try {
        const draftData = await getFormDraft({ nik, form_id: formId });
        if (draftData && !draftLoadedRef.current) {
          setAnswers(draftData);
          toast.info('Draft berhasil dimuat!');
          draftLoadedRef.current = true;
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
        toast.error('Gagal memuat draft');
      }
    }
    loadDraft();
  }, [nik, formId, questions]);

  useEffect(() => {
    if (!nik || !formId) return
    if (Object.keys(debouncedAnswers).length === 0) return

    const saveDraft = async () => {
      setIsSaving(true)
      setJustSaved(false)

      try {
        // Wait for any existing save operation to complete
        if (saveQueueRef.current) {
          await saveQueueRef.current
        }

        // Create new save promise
        const savePromise = saveFormDraft({
          nik,
          form_id: formId,
          draft_data: debouncedAnswers,
        })

        saveQueueRef.current = savePromise
        await savePromise

        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 5000)
      } catch (err) {
        console.error('Draft save failed', err)
      } finally {
        setIsSaving(false)
        saveQueueRef.current = null
      }
    }

    saveDraft()
  }, [debouncedAnswers, nik, formId])

  const handleAnswerChange = (
    questionId: string,
    questionType: string,
    answer: any
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { type: questionType, answer },
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      const unansweredMandatory = questions.filter(q => 
        q.mandatory && !answers[q.questionId]
      )

      if (unansweredMandatory.length > 0) {
        alert(`Mohon isi pertanyaan wajib berikut:\n${unansweredMandatory.map(q => `- ${q.title}`).join('\n')}`)
        setSubmitting(false)
        return
      }

      const normalResponses: {
        questionId: string
        questionType: number
        answer: any
      }[] = []

      const documentUploads: {
        questionId: string
        files: File[]
      }[] = []

      for (const [questionId, { type, answer }] of Object.entries(answers)) {
        const typeObj = STATIC_QUESTION_TYPES.find(t => t.type === type)
        const files = Array.isArray(answer?.files) ? answer.files : (answer?.file ? [answer.file] : []);
        if ((type === "7" || typeObj?.name === 'Document Upload')) {
          continue;
        } else {
          let formattedAnswer: any = {}
          let questionTypeNumber: number
          
          switch (type) {
            case "1": // Yes/No
              questionTypeNumber = 1
              formattedAnswer = { value: answer?.value || '' }
              break
            case "2": // Text
              questionTypeNumber = 2
              formattedAnswer = { value: answer?.value || '' }
              break
            case "3": // Single Item Choice
              questionTypeNumber = 3
              formattedAnswer = { choiceId: answer?.choiceId || '' }
              break
            case "4": // Single Item Choice with Text
              questionTypeNumber = 4
              formattedAnswer = { choiceId: answer?.choiceId || '', value: answer?.value || '' }
              break
            case "5": // Multiple Choice
              questionTypeNumber = 5
              formattedAnswer = { values: answer?.choiceIds || [] }
              break
            case "6": // Multiple Choice with Text
              questionTypeNumber = 6
              const multipleChoiceValues: (string | { choiceId: string | null; value: string })[] = []
              
              // Add selected choice IDs as strings
              if (answer?.choiceIds && Array.isArray(answer.choiceIds)) {
                answer.choiceIds.forEach((choiceId: string) => {
                  multipleChoiceValues.push(choiceId)
                })
              }
              
              // Add text value as object (if exists)
              if (answer?.value && answer.value.toString().trim() !== '') {
                multipleChoiceValues.push({
                  choiceId: null,
                  value: answer.value.toString()
                })
              }
              
              formattedAnswer = { values: multipleChoiceValues }
              break
            default:
              questionTypeNumber = parseInt(type) || 2
              formattedAnswer = answer || {}
          }

          normalResponses.push({ 
            questionId, 
            questionType: questionTypeNumber, 
            answer: formattedAnswer 
          })
        }
      }

      if (normalResponses.length > 0) {
        await submitAnswers({
          nik,
          formId,
          responses: normalResponses,
        })
      }

      if (documentUploads.length > 0) {
        const uploadPromises = documentUploads.map(({ questionId, files }) =>
          uploadDocument({ files, nik, questionId })
        )
        await Promise.all(uploadPromises)
      }

      try {
        const session_id = localStorage.getItem('session_id');
        if (session_id) {
          const tempFiles = await getTempUploads(session_id);
          const filesToDelete = (Array.isArray(tempFiles) ? tempFiles : tempFiles.files || []).filter(
            (file) => file.form_id === formId
          );
          for (const file of filesToDelete) {
            try {
              await deleteTempUpload(file.id);
            } catch (err) {
              console.error('Failed to delete temp upload', file.id, err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to clean up temp uploads', err);
      }

      // Wait for any pending auto-save to complete before deleting draft
      if (saveQueueRef.current) {
        try {
          await saveQueueRef.current
        } catch (err) {
          console.error('Failed to wait for auto-save completion:', err)
        }
      }

      // Add retry mechanism for draft deletion
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          await deleteFormDraft({ nik, form_id: formId })
          break // Success, exit retry loop
        } catch (err) {
          retryCount++
          console.error(`Draft deletion attempt ${retryCount} failed:`, err)
          
          if (retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          } else {
            console.error('Failed to delete draft after all retries')
            // Don't fail the form submission if draft deletion fails
          }
        }
      }

      toast.success('Formulir berhasil dikirim!');
      router.refresh();
    } catch (err: any) {
      console.error('Gagal mengirim form:', err)
      toast.error('Gagal mengirim formulir. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await saveFormDraft({ nik, form_id: formId, draft_data: answers })
      toast.success('Draft berhasil disimpan!')
    } catch (e) {
      toast.error('Gagal menyimpan draft')
    }
  }

  return (
    <div>
      <FormHeader
        {...headerProps}
        isSaving={isSaving}
        justSaved={justSaved}
      />

      <FormQuestionGroup
        questions={questions}
        onAnswerChange={handleAnswerChange}
        answers={answers}
        nik={nik}
        formId={formId}
      />

      <div className="mt-6 text-right">
        {submitting && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-700">Mengirim formulir...</span>
            </div>
          </div>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Mengirim...' : 'Kirim Formulir'}
        </button>
      </div>
    </div>
  )
}
