import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

{ /* Application Api Function */}

// Refresh token function
export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID
    
    if (!refreshToken || !clientId) {
      throw new Error('Refresh token or client ID not found')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SSO_AUTH_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    
    // Update tokens in localStorage
    localStorage.setItem('access_token', data.access_token)
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    
    return data.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    // Clear all tokens and redirect to login
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token')
    window.location.href = '/'
    throw error
  }
}

// Check if token is expired (basic check)
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    return true // If we can't decode, assume expired
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export async function login(nik: string, password: string) {
  const response = await api.post('/login', { nik, password })
  return response.data
}

export async function logout() {
  return api.post('/logout')
}

export async function fetchCurrentUser() {
  const response = await api.get('/user')
  return response.data
}

export async function fetchQuestionsByFormId(formId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions?form_id=${formId}`)
  if (!res.ok) throw new Error('Gagal fetch data')
  const data = await res.json()
  return Array.isArray(data.questions) ? data.questions : []
}

export async function fetchQuestionsBySectionId(sectionId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions?section_id=${sectionId}`);
    
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      throw new Error(`API returned non-JSON: ${text.substring(0, 100)}`);
    }

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch questions');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data?.questions || [];
  } catch (err) {
    console.error('fetchQuestionsBySectionId error:', err);
    return []; 
  }
}

{/* Bagian Form */}

export async function createForm(data: {
  title: string
  description?: string
  comment?: string
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'Gagal membuat form')
  }

  return res.json()
}


export async function deleteForm(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Gagal menghapus form')
  }
}

export async function updateForm(id: string, data: Partial<{
  title: string
  description?: string
  comment?: string
}>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Gagal mengupdate form')
  }

  return res.json()
}

{/* Bagian Section */}

export async function createSection(data: {
  category_id: string
  section: string
  title: string
  description?: string
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'Gagal membuat section')
  }

  return res.json()
}

export async function getSections(formId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}/sections/ordered`)
  if (!res.ok) throw new Error('Gagal mengambil section')
  const response: FormSectionsResponse = await res.json()
  
  console.log('Raw sections response:', response)
  
  // Transform response to match expected format
  if (response.success && response.data) {
    const transformedSections = response.data
      .map((item: any) => ({
        id: item.section_id,
        category_id: item.section.category_id,
        section: item.section.section,
        title: item.section.title || item.section.section, // Use section name as title if title is null
        description: item.section.description,
        order_sequence: parseInt(item.order_sequence) || 0
      }))
      .sort((a, b) => a.order_sequence - b.order_sequence) // Sort by order_sequence ascending
    
    console.log('Transformed sections:', transformedSections)
    return transformedSections
  }
  
  return []
}

export async function getAllSections() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sections`)
    console.log('getAllSections response status:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('getAllSections error response:', errorText)
      throw new Error(`Gagal mengambil semua section: ${res.status} ${res.statusText}`)
    }
    
    const response = await res.json()
    console.log('Raw all sections response:', response)
    
    // API returns array directly, not wrapped in success/data
    if (!Array.isArray(response)) {
      console.error('Unexpected response format:', response)
      return []
    }
    
    const transformedSections = response.map((item: any) => ({
      id: item.id,
      category_id: item.category_id,
      section: item.section,
      title: item.title || item.section, // Use section name if title is null
      description: item.description,
      order_sequence: item.order_sequence || 0
    }))
    
    console.log('Transformed all sections:', transformedSections)
    return transformedSections
  } catch (error) {
    console.error('getAllSections error:', error)
    throw error
  }
}

export async function deleteSection(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sections/${id}`, {
    method: 'DELETE',
  });

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null; 
  }

  try {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete section');
    }
    return data;
  } catch (err) {
    if (res.ok) {
      return null; 
    }
    throw new Error('Failed to delete section');
  }
}

export async function updateSection(id: string, data: Partial<{
  category_id: string
  section: string
  title: string
  description?: string
}>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sections/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Gagal mengupdate section')
  }

  return res.json()
}

{/* Bagian Category */}

export async function createCategory(data: {
  category: string
  title: string
  description?: string
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'Gagal membuat kategori')
  }

  return res.json()
}


import { Category, FormSectionsResponse } from '@/types/index'

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'Gagal mengambil kategori')
  }

  const data = await res.json()
  return data
}

{/* Bagian Question */}

export async function createQuestion(data: {
  form_id: string
  type_id: string
  category_id: string
  section_id: string
  title: string
  description?: string
  comment?: string
  is_mandatory: boolean
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Gagal menambahkan pertanyaan')
  }

  return res.json()
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`;
    console.log('Delete question URL:', url);
    console.log('Attempting to delete question:', id);
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('Delete response status:', res.status);
    console.log('Delete response headers:', Object.fromEntries(res.headers.entries()));

    // Handle successful deletion (204 No Content)
    if (res.status === 204) {
      console.log('Question deleted successfully (204)');
      return;
    }

    // Handle other successful responses
    if (res.ok) {
      console.log('Question deleted successfully');
      return;
    }

    // Handle different error status codes
    if (res.status === 404) {
      throw new Error('Pertanyaan tidak ditemukan');
    }
    
    if (res.status === 403) {
      throw new Error('Tidak memiliki izin untuk menghapus pertanyaan');
    }

    // For 500 and other errors, try to get the actual error message from server
    const contentType = res.headers.get('content-type');
    console.log('Response content-type:', contentType);
    
    if (contentType?.includes('application/json')) {
      try {
        const data = await res.json();
        console.log('Error response data:', data);
        throw new Error(data.message || data.error || `Gagal menghapus pertanyaan (${res.status})`);
      } catch (parseError) {
        console.error('Failed to parse JSON error response:', parseError);
        throw new Error(`Gagal menghapus pertanyaan (${res.status})`);
      }
    } else {
      try {
        const text = await res.text();
        console.log('Error response text:', text);
        throw new Error(text || `Gagal menghapus pertanyaan (${res.status})`);
      } catch (parseError) {
        console.error('Failed to parse text error response:', parseError);
        throw new Error(`Gagal menghapus pertanyaan (${res.status})`);
      }
    }
  } catch (error) {
    console.error('Delete question error:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Koneksi jaringan bermasalah');
    }
    
    // Re-throw other errors
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal menghapus pertanyaan');
  }
}

export async function copyQuestion(questionId: string): Promise<any> {
  try {
    console.log('Copying question:', questionId);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/copy`;
    console.log('Copy question URL:', url);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('Copy response status:', res.status);

    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.message || data.error || `Gagal menyalin pertanyaan (${res.status})`);
      } else {
        const text = await res.text();
        throw new Error(text || `Gagal menyalin pertanyaan (${res.status})`);
      }
    }

    const result = await res.json();
    console.log('Question copied successfully:', result);
    
    // Check if the copy operation was successful but copied_question is null
    if (result.message === 'Question copied successfully' && result.copied_question === null) {
      console.warn('Copy operation succeeded but copied_question is null. This might indicate a backend issue.');
      // Still consider it successful since the message says it was copied
      return result;
    }
    
    return result;
  } catch (error) {
    console.error('Copy question error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Koneksi jaringan bermasalah');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal menyalin pertanyaan');
  }
}

export async function updateQuestion(id: string, data: Partial<{
  type_id: string
  category_id: string
  section_id: string
  title: string
  description?: string
  comment?: string
  is_mandatory: boolean
}>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', 
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Gagal mengupdate pertanyaan')
  }

  return res.json()
}

export async function reorderQuestions(formId: string, questionOrder: Array<{id: string, order_sequence: number}>): Promise<void> {
  try {
    console.log('Reordering questions for form:', formId)
    console.log('Question order with sequence:', questionOrder)
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token')
    if (!token) {
      throw new Error('Token tidak ditemukan')
    }
    
    // Get API URL with fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const url = `${apiUrl}/forms/${formId}/questions/reorder`
    
    console.log('API URL:', apiUrl)
    console.log('Full URL:', url)
    console.log('Token exists:', !!token)
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token')
    console.log('Request payload:', { questions: questionOrder })
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ questions: questionOrder }),
    })

    console.log('Reorder response status:', res.status)

    if (!res.ok) {
      const contentType = res.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const error = await res.json()
        throw new Error(error.message || 'Gagal mengubah urutan pertanyaan')
      } else {
        const text = await res.text()
        throw new Error(text || 'Gagal mengubah urutan pertanyaan')
      }
    }

    console.log('Questions reordered successfully')
  } catch (error) {
    console.error('Reorder questions error:', error)
    throw error
  }
}

export async function reorderSections(formId: string, sectionId: string, orderSequence: number): Promise<void> {
  try {
    console.log('Reordering section:', { formId, sectionId, orderSequence })
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token')
    if (!token) {
      throw new Error('Token tidak ditemukan')
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const url = `${apiUrl}/forms/${formId}/sections/reorder`
    
    console.log('API URL:', apiUrl)
    console.log('Full URL:', url)
    console.log('Request payload:', { form_id: formId, section_id: sectionId, order_sequence: orderSequence })
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        form_id: formId, 
        section_id: sectionId, 
        order_sequence: orderSequence 
      }),
    })

    console.log('Reorder sections response status:', res.status)

    if (!res.ok) {
      const contentType = res.headers.get('content-type')
      console.log('Response content-type:', contentType)
      
      if (contentType?.includes('application/json')) {
        try {
          const error = await res.json()
          console.log('Error response:', error)
          throw new Error(error.message || error.error || 'Gagal mengubah urutan section')
        } catch (parseError) {
          console.log('Parse error:', parseError)
          throw new Error('Gagal mengubah urutan section')
        }
      } else {
        const text = await res.text()
        console.log('Error text:', text)
        throw new Error(text || 'Gagal mengubah urutan section')
      }
    }

    console.log('Sections reordered successfully')
  } catch (error) {
    console.error('Reorder sections error:', error)
    throw error
  }
}

export async function reorderChoices(questionId: string, choiceId: string, orderSequence: number): Promise<void> {
  try {
    console.log('Reordering choice:', { questionId, choiceId, orderSequence })
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token')
    if (!token) {
      throw new Error('Token tidak ditemukan')
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const url = `${apiUrl}/choices/reorder`
    
    console.log('API URL:', apiUrl)
    console.log('Full URL:', url)
    console.log('Request payload:', { question_id: questionId, choice_id: choiceId, order_sequence: orderSequence })
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        question_id: questionId, 
        choice_id: choiceId, 
        order_sequence: orderSequence 
      }),
    })

    console.log('Reorder choices response status:', res.status)

    if (!res.ok) {
      const contentType = res.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const error = await res.json()
        throw new Error(error.message || 'Gagal mengubah urutan pilihan')
      } else {
        const text = await res.text()
        throw new Error(text || 'Gagal mengubah urutan pilihan')
      }
    }

    console.log('Choices reordered successfully')
  } catch (error) {
    console.error('Reorder choices error:', error)
    throw error
  }
}

export async function getChoicesByQuestionId(questionId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/choices/${questionId}/ordered`)
    console.log('Get choices response status:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Get choices error response:', errorText)
      throw new Error(`Gagal mengambil choices: ${res.status} ${res.statusText}`)
    }
    
    const response = await res.json()
    console.log('Raw choices response:', response)
    
    // API returns success/data wrapper
    if (response.success && response.data) {
      const transformedChoices = response.data.map((item: any) => ({
        id: item.id,
        question_id: item.question_id,
        choice_id: item.choice_id,
        description: item.description,
        comment: item.comment,
        order_sequence: parseInt(item.order_sequence) || 0
      }))
      
      console.log('Transformed choices:', transformedChoices)
      return transformedChoices
    }
    
    return []
  } catch (error) {
    console.error('Get choices error:', error)
    throw error
  }
}

{/* Bagian Jawaban */}
export async function uploadDocument({
  files,
  nik,
  questionId,
}: {
  files: File[] 
  nik: string
  questionId: string
}) {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files[]', file)
  })

  const payload = JSON.stringify({ nik, questionId })
  formData.append('request', payload)

  const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/api/documents/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Upload gagal')
  }

  return await res.json()
}

export async function submitAnswers({
  nik,
  formId,
  responses
}: {
  nik: string
  formId: string
  responses: any[]
}) {
  await fetch(`${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/sanctum/csrf-cookie`, {
    credentials: 'include'
  })
  

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nik, formId, responses }),
    credentials: 'include', 
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Gagal mengirim jawaban')
  }

  return await res.json()
}

export async function uploadTempDocument({
  file,
  nik,
  session_id,
  form_id,
  question_id,
}: {
  file: File
  nik: string
  session_id: string
  form_id: string
  question_id: string
}) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('nik', nik);
  formData.append('session_id', session_id);
  formData.append('form_id', form_id);
  formData.append('question_id', question_id);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-temp`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload temp document gagal');
  }

  return await res.json();
}

export async function getTempUploads(session_id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/temp-uploads?session_id=${encodeURIComponent(session_id)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Gagal mengambil temp uploads');
  }
  return await res.json();
}

export async function deleteTempUpload(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/temp-uploads/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Gagal menghapus file upload sementara');
  }
  return await res.json();
}

{/* Bagian Draft Form */}

export async function saveFormDraft({ nik, form_id, draft_data }: { nik: string, form_id: string, draft_data: any }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/form-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nik, form_id, draft_data }),
  });
  if (!res.ok) throw new Error('Failed to save draft');
  return res.json();
}

export async function getFormDraft({ nik, form_id }: { nik: string, form_id: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/form-draft?nik=${nik}&form_id=${form_id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.draft?.draft_data || null;
}

export async function deleteFormDraft({ nik, form_id }: { nik: string, form_id: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/form-draft`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nik, form_id }),
  });
  if (!res.ok) throw new Error('Failed to delete draft');
  return res.json();
}

{/* Bagian Submissions dan Answers */}

export async function getFormSubmissions(formId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}/submissions`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Gagal mengambil daftar submissions');
  }
  return res.json();
}

export async function getFormAnswers(formId: string, nik: string, sequence: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}/answers/${nik}?sequence=${sequence}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Gagal mengambil jawaban');
  }
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export async function createTemplateQuestions(formId: string, templateQuestions: any[]) {
  console.log('Creating template questions for form:', formId)
  
  try {
    for (const template of templateQuestions) {
      // Step 1: Create question without choices
      const questionData = {
        form_id: formId,
        type_id: template.type_id,
        category_id: template.category_id,
        section_id: template.section_id,
        title: template.title,
        description: template.description,
        comment: template.comment,
        is_mandatory: template.is_mandatory
      }
      
      console.log('Creating question with data:', JSON.stringify(questionData, null, 2))
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      })

      console.log('Response status:', res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Failed to create question:', errorData)
        throw new Error(errorData.message || `Gagal membuat pertanyaan template (${res.status})`)
      }

      const createdQuestion = await res.json()
      console.log('Question created successfully:', createdQuestion)
      
      // Step 2: Map choices if question has choices
      if (template.choices && template.choices.length > 0) {
        console.log('Mapping choices to question:', createdQuestion.questionId || createdQuestion.id)
        
        const choiceMappingData = {
          choice_ids: template.choices
        }
        
        const choiceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${createdQuestion.questionId || createdQuestion.id}/choices/map`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(choiceMappingData),
        })
        
        if (choiceRes.ok) {
          const choiceResult = await choiceRes.json()
          console.log('Choices mapped successfully:', choiceResult)
        } else {
          const choiceError = await choiceRes.json()
          console.error('Failed to map choices:', choiceError)
          throw new Error(choiceError.message || 'Gagal memetakan pilihan')
        }
      }
    }
    
    console.log('All template questions created successfully')
    return true
    
  } catch (error) {
    console.error('Error creating template questions:', error)
    throw error
  }
}
