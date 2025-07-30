'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Props {
  title?: string
  message?: string
  onConfirm: () => void
  trigger: React.ReactNode
}

export default function DeleteConfirmation({ title, message, onConfirm, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
      >
        {trigger}
      </div>

      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity"
        />

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <DialogPanel
            transition
            className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full p-6 transition-all transform"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                {title || 'Hapus Form?'}
              </DialogTitle>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {message ||
                'Apakah Anda yakin ingin menghapus form ini? Tindakan ini tidak bisa dibatalkan.'}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm();
                }}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
