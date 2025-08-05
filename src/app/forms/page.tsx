'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'
import { FiPlus, FiFileText, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'

import { Form, FormWithCustomURLs } from '@/types'
import { deleteForm, updateForm, getFormWithCustomURLs } from '@/lib/api'  
import FormCardAdmin from '@/components/forms/admin/FormCardAdmin'
import FormCardUser from '@/components/forms/user/FormCardUser'
import HomepageHeader from '@/components/common/HomepageHeader'
import EditFormModal from '@/components/modal/EditFormModal'
import CreateFormModal from '@/components/modal/CreateFormModal'
import { getFormStatus } from '@/lib/formUtils'

export default function HomePage() {
  const [forms, setForms] = useState<FormWithCustomURLs[]>([])
  const [loading, setLoading] = useState(true)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()

  const activeForms = forms.filter(form => {
    const status = getFormStatus(form)
    return status.isActive && !status.isExpired
  })
  
  const inactiveForms = forms.filter(form => {
    const status = getFormStatus(form)
    return !status.isActive && !status.isExpired
  })
  
  const expiredForms = forms.filter(form => {
    const status = getFormStatus(form)
    return status.isExpired
  })

  useEffect(() => {
    async function fetchForms() {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error('Failed to fetch forms')
        const data = await res.json()
        
        const formsWithCustomURLs = await Promise.all(
          data.map(async (form: Form) => {
            try {
              const formWithCustomURLs = await getFormWithCustomURLs(form.id)
              return formWithCustomURLs.form
            } catch (error) {
              console.error(`Failed to fetch custom URLs for form ${form.id}:`, error)
              return { ...form, custom_urls: [] } as FormWithCustomURLs
            }
          })
        )
        
        setForms(formsWithCustomURLs)
      } catch (err) {
        console.error('Auth or fetch failed:', err)
        toast.error('Session berakhir. Silakan login kembali. ')
        router.push('/');
      } finally {
        setLoading(false)
      }
    }

    fetchForms()
  }, [router])

  const handleEdit = (form: Form) => setEditingForm(form)

  const handleSaveEdit = async (data: Partial<Form>) => {
    if (!editingForm) return
    try {
      const updated = await updateForm(editingForm.id, data)
      setForms((prev) =>
        prev.map((f) => (f.id === editingForm.id ? { ...f, ...updated } : f))
      )
      setEditingForm(null)
      toast.success('Form berhasil diubah')
    } catch (err: any) {
      console.error('Failed to update form:', err)
      toast.error(err.message || 'Gagal mengubah form')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteForm(id)
      setForms((prev) => prev.filter((form) => form.id !== id))
      toast.success('Form berhasil dihapus')
    } catch (err) {
      console.error('Failed to delete form:', err)
      toast.error('Gagal menghapus form')
    }
  }

  const handleCreated = (form: Form) => {
    setForms((prev) => [form, ...prev]) 
    setShowCreate(false)
    toast.success('Form berhasil dibuat')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto mt-20">
            <HomepageHeader showResponsesButton={false} showCreateFormButton={true} />

            {/* Form Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FiFileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Form</p>
                    <p className="text-xl font-bold text-gray-900">{forms.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktif</p>
                    <p className="text-xl font-bold text-gray-900">{activeForms.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <FiXCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nonaktif</p>
                    <p className="text-xl font-bold text-gray-900">{inactiveForms.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <FiClock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Berakhir</p>
                    <p className="text-xl font-bold text-gray-900">{expiredForms.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Saya Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Saya</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div
                  onClick={() => setShowCreate(true)}
                  className="cursor-pointer border-2 border-dashed border-blue-300 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FiPlus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Buat Form Baru</h3>
                    <p className="text-sm text-gray-600">Mulai membuat form baru</p>
                  </div>
                </div>
                
                {forms.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FiFileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada form</h3>
                    <p className="text-gray-600">Mulai dengan membuat form pertama Anda</p>
                  </div>
                ) : (
                  forms.map((form) => (
                    <FormCardAdmin key={form.id} form={form} onEdit={handleEdit} onDelete={handleDelete} />
                  ))
                )}
              </div>
            </div>

            {/* Daftar Form Aktif Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Daftar Form Aktif</h2>

              {activeForms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FiFileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada form aktif</h3>
                  <p className="text-gray-600">Form aktif akan muncul di sini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {activeForms.map((form) => (
                    <FormCardUser
                      key={form.id}
                      form={form}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Daftar Form Berakhir Section */}
            {expiredForms.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Berakhir</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {expiredForms.map((form) => (
                    <FormCardUser
                      key={form.id}
                      form={form}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {editingForm && (
          <EditFormModal
            form={editingForm}
            onSave={handleSaveEdit}
            onClose={() => setEditingForm(null)}
          />
        )}

        {showCreate && (
          <CreateFormModal
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}  
      </div>
    </>
  )
}
