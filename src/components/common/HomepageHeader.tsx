'use client'

import { useState, useEffect } from 'react'
import { FaBars, FaUserCircle } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Sidebar from './SideBar'
import CreateFormModal from '../modal/CreateFormModal'

export default function HomepageHeader({ showResponsesButton = true, showCreateFormButton = true, isAdminPage = false }: { showResponsesButton?: boolean, showCreateFormButton?: boolean, isAdminPage?: boolean }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const router = useRouter()

  return (
    <>
      <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FaBars className="text-xl text-gray-700" />
          </button>
          
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Form Koperasi</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 group"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <FaUserCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Profil</span>
          </button>
        </div>
      </header>

      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        onCreateForm={() => setShowCreateForm(true)}
        showCreateFormButton={showCreateFormButton}
        isAdminPage={isAdminPage}
      />

      {showCreateForm && (
        <CreateFormModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => setShowCreateForm(false)} 
        />
      )}
    </>
  )
}
