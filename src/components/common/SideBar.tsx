'use client'

import { useEffect, useRef, useState } from 'react'
import { FaPlusCircle, FaUserCircle, FaDoorOpen, FaHome, FaTimes, FaBuilding, FaIdCard, FaEnvelope } from 'react-icons/fa'
import { FiFileText } from 'react-icons/fi'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { fetchWithTokenRefresh } from '@/lib/tokenUtils'

interface SidebarProps {
  showSidebar: boolean
  setShowSidebar: (value: boolean) => void
  onCreateForm: () => void
  showCreateFormButton?: boolean
  isAdminPage?: boolean
}

export default function Sidebar({ showSidebar, setShowSidebar, onCreateForm, showCreateFormButton = true, isAdminPage = false }: SidebarProps) {
  const sidebarRef = useRef(null)
  const router = useRouter()
  const params = useParams() as { id?: string; formToken?: string }
  const formId = params.id // Only use id, not formToken for sidebar button
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    if (showSidebar) {
      setVisible(true)
      setTimeout(() => setAnimateIn(true), 10)
    } else {
      setAnimateIn(false)
      const timeout = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [showSidebar])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !(sidebarRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setShowSidebar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowSidebar])

  if (!visible) return null

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('session_id');
    try {
      if (sessionId) {
        console.log('Logout: session_id', sessionId);
        const response = await fetchWithTokenRefresh(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const result = await response.json();
        console.log('Logout response:', result);
        if (response.ok) {
          toast.success('Berhasil logout');
        } else {
          toast.error('Logout gagal: ' + ((result as any).message || 'Gagal logout'));
        }
      }
    } catch (e: any) {
      toast.error('Logout gagal: ' + (e?.message || e));
    }
    localStorage.removeItem('token');
    localStorage.removeItem('nik');
    localStorage.removeItem('session_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setShowSidebar(false);
    router.push('/');
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          animateIn ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setShowSidebar(false)}
      />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-72 bg-white shadow-2xl z-50
          transform transition-all duration-300 ease-in-out flex flex-col
          ${animateIn ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-bold text-gray-80 0">Menu</h2>
              <p className="text-xs text-gray-500">Form Koperasi</p>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => {
                router.push('/forms')
                setShowSidebar(false)
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200 group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FaHome className="text-blue-600" />
              </div>
              <span className="font-medium">Beranda</span>
            </button>

            {/* User Responses Menu - Only show when on a form page and NOT admin page */}
            {formId && !isAdminPage && (
              <button
                onClick={() => {
                  router.push(`/forms/${formId}/user-responses`)
                  setShowSidebar(false)
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all duration-200 group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FiFileText className="text-purple-600" />
                </div>
                <span className="font-medium">Riwayat Submission</span>
              </button>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 space-y-2">
                    
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-700 transition-all duration-200 group"
          >
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <FaDoorOpen className="text-red-600" />
            </div>
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>
    </>
  )
}
