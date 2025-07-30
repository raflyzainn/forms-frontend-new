// components/forms/FormHeader.tsx
import React from 'react'
import { FaSpinner, FaCloudUploadAlt } from 'react-icons/fa'

interface FormHeaderProps {
  title: string
  description?: string | null
  comment?: string | null

  isSaving?: boolean
  justSaved?: boolean
}

export default function FormHeader({  
  title,
  description,
  comment,
  isSaving = false,
  justSaved = false,
}: FormHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-t-lg border border-gray-200 shadow-sm mt-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-normal text-gray-700">{title}</h1>

        <div className="relative flex items-center min-w-[140px] h-6">
          {isSaving ? (
            <span className="flex items-center transition-opacity duration-500 ease-in-out opacity-100">
              <FaSpinner className="animate-spin h-5 w-5 text-gray-600 mr-1" />
              <span className="text-xs text-gray-600">Menyimpan Draft</span>
            </span>
          ) : (
            <span className="flex items-center transition-opacity duration-500 ease-in-out opacity-100">
              <FaCloudUploadAlt className="h-5 w-5 text-green-600 mr-1" />
              <span className="text-xs text-green-700">Draft Tersimpan</span>
            </span>
          )}
        </div>
      </div>

      {description && <p className="text-sm text-gray-500">{description}</p>}
      {comment && <p className="text-xs text-gray-400 mt-2">{comment}</p>}
    </div>
  )
}
