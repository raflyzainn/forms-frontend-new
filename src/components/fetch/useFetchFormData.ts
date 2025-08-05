import { useEffect, useState, useCallback } from 'react'
import { Question, Section } from '@/types'
import { getSections } from '@/lib/api' // pastikan path-nya sesuai dengan letak `getSections`

export function useFetchFormData(formId: string) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [sections, setSections] = useState<Section[]>([]) // ✅ tambahkan state sections
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const [qRes, fRes, fetchedSections] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions?form_id=${formId}&_t=${Date.now()}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}`),
        getSections(formId) // ✅ ambil urutan section sesuai map_form_section
      ])

      const qData = await qRes.json()
      const fData = await fRes.json()

      const questionsArray = Array.isArray(qData.questions) ? qData.questions : qData

      const sortedQuestions = questionsArray.sort((a: Question, b: Question) => {
        const aAny = a as any
        const bAny = b as any
        const orderA = a.order_sequence || aAny.orderSequence || aAny.order || aAny.sequence || 0
        const orderB = b.order_sequence || bAny.orderSequence || bAny.order || bAny.sequence || 0
        return orderA - orderB
      })

      setQuestions(sortedQuestions)
      setSections(fetchedSections) // ✅ simpan section hasil dari getSections()

      if (fData.form) {
        setTitle(fData.form.name || fData.form.title || 'Form tidak ditemukan')
        setDescription(fData.form.description || '')
        setComment(fData.form.comment || '')
      } else {
        setTitle(fData.title || 'Form tidak ditemukan')
        setDescription(fData.description || '')
        setComment(fData.comment || '')
      }
    } catch (error) {
      console.error('Error fetching form data:', error)
      setQuestions([])
      setSections([])
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

  return {
    title,
    description,
    comment,
    questions,
    sections, // ✅ masukkan ke return value
    loading,
    refresh
  }
}
