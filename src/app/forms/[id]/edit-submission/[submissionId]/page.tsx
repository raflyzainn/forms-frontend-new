'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSubmissionById, updateSubmission, updateAnswer, getTempUploads, deleteTempUpload } from '@/lib/api'
import { useFetchFormData } from '@/components/fetch/useFetchFormData'
import FormSubmissionWrapper from '@/components/forms/user/FormSubmissionWrapper'
import HomepageHeader from '@/components/common/HomepageHeader'
import { FiArrowLeft, FiSave, FiAlertTriangle } from 'react-icons/fi'
import { toast } from 'react-toastify'

interface SubmissionData {
  submission_id: string
  nik: string
  form_id: string
  form_title: string
  form_status: string
  is_form_open: boolean
  sequence: string
  submitted_date: string
  created_time: string
  updated_time: string
  answers: Array<{
    answer_id: string
    question_id: string
    question_title: string
    value: string | null
    choices: Array<{
      choice_id: string
      title: string
    }>
    documents: Array<{
      document_id: string
      document_path: string
      file_name: string
      description: string | null
    }>
  }>
}

export default function EditSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  const submissionId = params.submissionId as string
  
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserNik, setCurrentUserNik] = useState<string | null>(null)

  const { title, description, comment, questions, loading: questionsLoading } = useFetchFormData(formId)

  useEffect(() => {
    const userNik = localStorage.getItem('nik')
    setCurrentUserNik(userNik)
    
    if (!userNik) {
      setError('NIK tidak ditemukan. Silakan login ulang.')
      return
    }

    fetchSubmissionData()
  }, [submissionId])

  const fetchSubmissionData = async () => {
    try {
      setLoading(true)
      const response = await getSubmissionById(submissionId)
      
      if (response.success && response.data) {
        const data = response.data
        
        // Check if user is authorized to edit this submission
        if (data.nik !== localStorage.getItem('nik')) {
          setError('Anda tidak memiliki akses untuk mengedit submission ini')
          return
        }
        
        setSubmissionData(data)
      } else {
        setError('Gagal mengambil data submission')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data submission')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubmission = async (responses: any[]) => {
    try {
      console.log('=== DEBUG: Starting handleUpdateSubmission ===');
      console.log('Responses received:', responses);
      console.log('Submission data:', submissionData);
      
      // Transform responses to match API format
      const answers = responses.map(response => {
        console.log('Processing response:', response);
        
        const existingAnswer = submissionData?.answers.find(
          a => a.question_id === response.questionId
        )
        
        console.log('Found existing answer:', existingAnswer);
        
        if (!existingAnswer) {
          console.error(`Answer tidak ditemukan untuk question ${response.questionId}`);
          console.log('Available question IDs:', submissionData?.answers.map(a => a.question_id));
          throw new Error(`Answer tidak ditemukan untuk question ${response.questionId}`)
        }

        // Handle documents properly - extract document paths
        let documents: string[] = []
        if (response.documents && Array.isArray(response.documents)) {
          console.log('Processing documents:', response.documents);
          documents = response.documents.map((doc: any) => {
            // If it's an existing document object, use the document_id
            if (doc && typeof doc === 'object' && doc.document_id) {
              return doc.document_id
            }
            // If it's a string (temp upload ID), use it directly
            if (typeof doc === 'string') {
              return doc
            }
            // If it's an object with id but no document_id (temp upload), use the id
            if (doc && typeof doc === 'object' && doc.id) {
              return doc.id
            }
            return ''
          }).filter(Boolean)
        } else if (response.fileId) {
          // If there's a fileId from temp upload
          documents = [response.fileId]
        }
        
        // Only preserve existing documents if explicitly no new documents in response
        // This allows empty documents array to clear existing documents
        console.log('Final documents for answer:', documents);

        // Handle choices properly - match the format used in regular form submission
        let choices: string[] = []
        let value = response.value || existingAnswer.value || null
        
        if (response.choiceIds && Array.isArray(response.choiceIds)) {
          choices = response.choiceIds
          console.log('Using new choiceIds from response:', choices);
        } else if (response.choiceId) {
          choices = [response.choiceId]
          console.log('Using new choiceId from response:', choices);
        } else if (existingAnswer.choices && existingAnswer.choices.length > 0) {
          choices = existingAnswer.choices.map((choice: any) => choice.choice_id || choice)
          console.log('Preserving existing choices:', choices);
        }
        
        // For "with text" questions, preserve existing text value if not explicitly changed
        const question = questions.find(q => q.questionId === response.questionId);
        const questionType = question?.type?.name;
        
        if ((questionType === 'Single Item Choice with Text' || questionType === 'Multiple Choice with Text') && 
            response.value === undefined && existingAnswer.value) {
          // If user didn't change the text field, preserve the existing text value
          value = existingAnswer.value;
          console.log('Preserving existing text value for', questionType, ':', value);
        }
        
        // For Multiple Choice with Text, we need to handle the text value separately
        // The backend expects choices array and value separately
        console.log('Final processed answer:', {
          answer_id: existingAnswer.answer_id,
          value: value,
          choices,
          documents
        });

        return {
          answer_id: existingAnswer.answer_id,
          value: value,
          choices,
          documents
        }
      })

      // Use the correct backend flow: call updateAnswer for each answer
      // Backend will automatically handle temp uploads
      console.log('Using correct backend flow with updateAnswer API');
      
      const updatePromises = answers.map(async (answer, index) => {
        try {
          console.log(`Updating answer ${answer.answer_id}:`, {
            value: answer.value,
            choices: answer.choices,
            documents: answer.documents
          });
          
          // Get the original response to find question type
          const originalResponse = responses[index];
          const question = questions.find(q => q.questionId === originalResponse.questionId);
          const questionType = question?.type?.name;
          
          let formattedAnswer: any = {};
          
          if (questionType === 'Multiple Choice') {
            // For Multiple Choice, use choices array like in Postman
            formattedAnswer = { choices: answer.choices || [] };
          } else if (questionType === 'Multiple Choice with Text') {
            // For Multiple Choice with Text, use choices array + value
            formattedAnswer = { 
              choices: answer.choices || [],
              value: answer.value || null
            };
          } else if (questionType === 'Single Item Choice with Text') {
            // For Single Item Choice with Text, use choiceId + value
            formattedAnswer = { 
              choiceId: answer.choices?.[0] || null,
              value: answer.value || null
            };
          } else if (questionType === 'Document Upload') {
            // For Document Upload, only send value (fileId)
            formattedAnswer = { value: answer.value || null };
          } else {
            // For other types, use the standard format
            formattedAnswer = {
              value: answer.value,
              choices: answer.choices
            };
          }
          
          // Call updateAnswer API - backend will handle temp uploads automatically
          const result = await updateAnswer(answer.answer_id, formattedAnswer);
          
          console.log(`Successfully updated answer ${answer.answer_id}:`, result);
          return result;
        } catch (error) {
          console.error(`Failed to update answer ${answer.answer_id}:`, error);
          throw error;
        }
      });
      
      await Promise.all(updatePromises);
      console.log('All answers updated successfully using updateAnswer API');
      
      // Note: We don't need to call updateSubmission anymore since we're using updateAnswer API
      // Backend will automatically handle temp uploads and update the submission
      
      // Cleanup temp uploads after successful update
      try {
        const session_id = localStorage.getItem('session_id')
        if (session_id) {
          const tempUploads = await getTempUploads(session_id)
          const files = Array.isArray(tempUploads) ? tempUploads : tempUploads.files || []
          
          // Delete all temp uploads for this form
          for (const file of files) {
            if (file.form_id === formId) {
              await deleteTempUpload(file.id)
            }
          }
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup temp uploads:', cleanupError)
        // Don't show error to user as submission was successful
      }
      
      toast.success('Submission berhasil diperbarui!')
      router.push(`/forms/${formId}/user-responses`)
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui submission')
    }
  }

  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data submission...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  if (!submissionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Data submission tidak ditemukan</p>
        </div>
      </div>
    )
  }

  // Transform submission data to match form format
  const preFilledAnswers = submissionData.answers.map(answer => {
    console.log('Processing answer for prefill:', answer);
    
    // Try to find question by ID first
    let question = questions.find(q => q.questionId === answer.question_id)
    
    // If not found by exact ID, try to find by title or other attributes
    if (!question) {
      console.warn(`Question not found for answer.question_id: ${answer.question_id}`);
      console.log('Available question IDs:', questions.map(q => q.questionId));
      
      // Try to find by question title if available
      if (answer.question_title) {
        question = questions.find(q => q.title === answer.question_title);
        if (question) {
          console.log(`Found question by title match: ${question.title}`);
        }
      }
    }
    
    // If still no question found, create a minimal mapping to preserve data
    if (!question) {
      console.warn(`Creating fallback mapping for question_id: ${answer.question_id}`);
      // Don't return null - preserve the answer data even if question mapping fails
      return {
        questionId: answer.question_id,
        value: answer.value || null,
        choiceIds: answer.choices?.map(c => c.choice_id) || [],
        documents: answer.documents?.map(d => ({
          document_id: d.document_id,
          file_name: d.file_name,
          path: d.document_path
        })) || []
      }
    }

    console.log('Successfully mapped answer with question:', question.title);
    return {
      questionId: answer.question_id,
      value: answer.value,
      choiceIds: answer.choices?.map(c => c.choice_id) || [],
      documents: answer.documents?.map(d => ({
        document_id: d.document_id,
        file_name: d.file_name,
        path: d.document_path
      })) || []
    }
  }).filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <HomepageHeader />
      
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 mt-17">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="text-xl text-gray-600" />
              </button>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiSave className="text-2xl text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Edit Submission</h1>
                <p className="text-gray-600">Perbarui jawaban Anda pada form ini</p>
              </div>
            </div>
          </div>
          
          {/* Submission Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">#{submissionData.sequence}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submission</p>
                <p className="font-semibold text-gray-800">#{submissionData.sequence}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-green-600">{submissionData.answers.length}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jawaban</p>
                <p className="font-semibold text-gray-800">{submissionData.answers.length} pertanyaan</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-600">
                  {new Date(submissionData.updated_time).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                <p className="font-semibold text-gray-800">
                  {new Date(submissionData.updated_time).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {questions.length > 0 && currentUserNik && (
          <FormSubmissionWrapper
            questions={questions}
            formId={formId}
            nik={currentUserNik}
            headerProps={{
              title: submissionData.form_title || title,
              description,
              comment,
            }}
            preFilledAnswers={preFilledAnswers}
            isEditMode={true}
            onSubmit={handleUpdateSubmission}
          />
        )}
      </div>
    </div>
  )
} 