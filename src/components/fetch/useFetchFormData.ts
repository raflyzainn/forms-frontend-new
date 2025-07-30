import { useEffect, useState, useCallback } from 'react'
import { Question } from '@/types'


export function useFetchFormData(formId: string) {
    const [questions, setQuestions] = useState<Question[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
  
    const fetchData = useCallback(async () => {
      try {
        setLoading(true)
        const qRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions?form_id=${formId}&_t=${Date.now()}`)
        const fRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}`)
        const qData = await qRes.json()
        const fData = await fRes.json()
        
        // Get questions array
        const questionsArray = Array.isArray(qData.questions) ? qData.questions : qData
        
        // Sort questions by order_sequence if available
        const sortedQuestions = questionsArray.sort((a: Question, b: Question) => {
          // Try different possible field names using type assertion
          const aAny = a as any
          const bAny = b as any
          const orderA = a.order_sequence || aAny.orderSequence || aAny.order || aAny.sequence || 0
          const orderB = b.order_sequence || bAny.orderSequence || bAny.order || bAny.sequence || 0
          return orderA - orderB
        })
        
        setQuestions(sortedQuestions)
        // Handle new API response structure
        if (fData.form) {
          setTitle(fData.form.name || fData.form.title || 'Form tidak ditemukan')
          setDescription(fData.form.description || '')
          setComment(fData.form.comment || '')
        } else {
          // Fallback for old API structure
          setTitle(fData.title || 'Form tidak ditemukan')
          setDescription(fData.description || '')
          setComment(fData.comment || '')
        }
      } catch (error) {
        console.error('Error fetching form data:', error)
        // Set default values on error to prevent infinite loading
        setQuestions([])
        setTitle('Form tidak ditemukan')
        setDescription('')
        setComment('')
      } finally {
        setLoading(false)
      }
    }, [formId])
  
    useEffect(() => {
      if (formId) {
        fetchData()
      }
    }, [formId, refreshKey])
  
    const refresh = useCallback(() => {
      setRefreshKey(prev => prev + 1)
    }, [])
  
    return { title, description, comment, questions, loading, refresh }
  }
  