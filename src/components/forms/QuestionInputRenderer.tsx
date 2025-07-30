'use client'

import { Question } from '@/types'
import { QuestionTypeName } from '@/types/enum'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import React from 'react';
import { uploadTempDocument, getTempUploads, deleteTempUpload } from '@/lib/api';
import { FiDownload, FiFile, FiImage, FiFileText } from 'react-icons/fi';

interface Props {
  question: Question
  name: string
  onAnswerChange: (answer: any) => void
  answer?: any
  nik: string
  formId: string
  readOnly?: boolean;
}

export default function QuestionInputRenderer({ question, name, onAnswerChange, answer, nik, formId, readOnly }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  console.log('Question type:', question.type?.name, 'Question:', question)

  const [multiChoiceState, setMultiChoiceState] = useState<{
    [questionId: string]: { selectedChoices: string[]; otherText?: string }
  }>({});

  const getMultiChoiceState = () =>
    multiChoiceState[question.questionId] || { selectedChoices: [], otherText: '' };

  const setMultiChoice = (newState: { selectedChoices: string[]; otherText?: string }) => {
    setMultiChoiceState((prev) => ({
      ...prev,
      [question.questionId]: newState,
    }));
    if (question.type?.name === QuestionTypeName.MultipleChoiceWithText) {
      onAnswerChange({ choiceIds: newState.selectedChoices, value: newState.otherText });
    } else {
      onAnswerChange({ choiceIds: newState.selectedChoices });
    }
  };

  switch (question.type?.name) {
    case QuestionTypeName.YesNo:
      return (
        <div className="mt-2 space-y-3">
          {['yes', 'no'].map((value) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer text-gray-800">
              <input
                type="radio"
                name={name}
                value={value}
                checked={answer?.value === value}
                onChange={() => onAnswerChange({ value })}
                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span>{value === 'yes' ? 'Ya' : 'Tidak'}</span>
            </label>
          ))}
        </div>
      )

    case QuestionTypeName.Text:
      return (
        <input
          type="text"
          name={name}
          value={answer?.value || ''}
          onChange={readOnly ? undefined : (e) => onAnswerChange({ value: e.target.value })}
          readOnly={readOnly}
          disabled={readOnly}
          className="w-full border border-gray-300 py-2 px-3 rounded focus:ring focus:ring-blue-300 bg-gray-100"
          placeholder="Jawaban"
        />
      )

    case QuestionTypeName.SingleItemChoice:
      return (
        <div className="space-y-2">
          {question.choices?.map((choice, index) => (
            <label key={`${choice.choiceId}-${index}`} className="flex items-center gap-2">
              <input
                type="radio"
                name={name}
                value={choice.choiceId}
                checked={answer?.choiceId === choice.choiceId}
                onChange={readOnly ? undefined : () => onAnswerChange({ choiceId: choice.choiceId })}
                className="h-4 w-4 text-blue-600 border-gray-300"
                disabled={readOnly}
              />
              <span>{choice.title}</span>
            </label>
          ))}
        </div>
      );

    case QuestionTypeName.MultipleChoice: {
      const selectedChoices = answer?.choiceIds || [];

      const handleCheckboxChange = (choiceId: string) => {
        const newChoices = selectedChoices.includes(choiceId)
          ? selectedChoices.filter((id: string) => id !== choiceId)
          : [...selectedChoices, choiceId];
        onAnswerChange({ choiceIds: newChoices });
      };

      return (
        <div className="space-y-2">
          {question.choices?.map((choice, index) => (
            <label key={`${choice.choiceId}-${index}`} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={choice.choiceId}
                checked={selectedChoices.includes(choice.choiceId)}
                onChange={() => handleCheckboxChange(choice.choiceId)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span>{choice.title}</span>
            </label>
          ))}
        </div>
      );
    }

    case QuestionTypeName.MultipleChoiceWithText: {
      const selectedChoices = answer?.choiceIds || [];
      const otherText = answer?.value || '';

      const handleCheckboxChange = (choiceId: string) => {
        const newChoices = selectedChoices.includes(choiceId)
          ? selectedChoices.filter((id: string) => id !== choiceId)
          : [...selectedChoices, choiceId];
        onAnswerChange({ choiceIds: newChoices, value: otherText });
      };

      const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onAnswerChange({ choiceIds: selectedChoices, value: e.target.value });
      };

      return (
        <div className="space-y-2">
          {question.choices?.map((choice, index) => (
            <label key={`${choice.choiceId}-${index}`} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={choice.choiceId}
                checked={selectedChoices.includes(choice.choiceId)}
                onChange={() => handleCheckboxChange(choice.choiceId)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                disabled={readOnly}
              />
              <span>{choice.title}</span>
            </label>
          ))}
          <input
            type="text"
            className="w-full border border-gray-300 py-2 px-3 rounded focus:ring focus:ring-blue-300"
            placeholder="Lainnya (sebutkan)"
            value={otherText}
            onChange={readOnly ? undefined : handleTextChange}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      );
    }

    case QuestionTypeName.SingleItemWithText:
      return (
        <div className="space-y-2">
          {question.choices?.map((choice, index) => (
            <label key={`${choice.choiceId}-${index}`} className="flex items-center gap-2">
              <input
                type="radio"
                name={name}
                value={choice.choiceId}
                checked={answer?.choiceId === choice.choiceId}
                onChange={readOnly ? undefined : () => onAnswerChange({ ...answer, choiceId: choice.choiceId })}
                className="h-4 w-4 text-blue-600 border-gray-300"
                disabled={readOnly}
              />
              <span>{choice.title}</span>
            </label>
          ))}
          <input
            type="text"
            className="w-full border border-gray-300 py-2 px-3 rounded focus:ring focus:ring-blue-300"
            placeholder="Lainnya (sebutkan)"
            value={answer?.value || ''}
            onChange={readOnly ? undefined : (e) => onAnswerChange({ ...answer, value: e.target.value, choiceId: null })}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      );

    case QuestionTypeName.DocumentUpload:
      if (readOnly) {
        if (!answer?.documents || answer.documents.length === 0) {
          return <div className="text-gray-400 italic">Tidak ada file diupload</div>;
        }
        return (
          <div className="flex flex-wrap gap-4 mt-2">
            {answer.documents.map((docObj: any) => {
              const fileId = docObj.document_id || (docObj.document && docObj.document.id);
              const filename = (docObj.document && (docObj.document.file_name || docObj.document.filename)) || docObj.file_name || docObj.filename || 'Download file';
              const fileUrl = fileId ? `http://localhost:8000/api/documents/${fileId}/download` : undefined;
              const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
              const isPdf = filename.match(/\.pdf$/i);
              
              return (
                <div key={fileId} className="flex flex-col items-center w-32">
                  {fileUrl && isImage ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={fileUrl}
                        alt={filename}
                        className="w-28 h-28 object-cover rounded border shadow hover:scale-105 transition"
                      />
                    </a>
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center bg-gray-100 rounded border shadow">
                      {isPdf ? (
                        <FiFileText className="w-12 h-12 text-red-500" />
                      ) : (
                        <FiFile className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                  )}
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-2 mt-2 px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition text-sm"
                  >
                    <FiDownload className="inline-block" />
                    Download
                  </a>
                  <div className="text-xs text-gray-600 mt-1 break-all text-center max-w-full">{filename}</div>
                </div>
              );
            })}
          </div>
        );
      }
      React.useEffect(() => {
        const session_id = localStorage.getItem('session_id');
        if (!session_id) return;
        getTempUploads(session_id)
          .then((data) => setUploadedFiles(Array.isArray(data) ? data : data.files || []))
          .catch((err) => setUploadError(err.message || 'Gagal mengambil file'));
      }, [question.questionId]);

      const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
          if (!acceptedFiles[0]) return;
          setUploading(true);
          setUploadError(null);
          const session_id = localStorage.getItem('session_id');
          try {
            await uploadTempDocument({
              file: acceptedFiles[0],
              nik,
              session_id: session_id || '',
              form_id: formId,
              question_id: question.questionId,
            });
            const data = await getTempUploads(session_id || '');
            setUploadedFiles(Array.isArray(data) ? data : data.files || []);
          } catch (err: any) {
            setUploadError(err.message || 'Upload gagal');
          } finally {
            setUploading(false);
          }
        },
        multiple: false,
      });

      const filteredFiles = uploadedFiles.filter(
        (file) => file.form_id === formId && file.question_id === question.questionId
      );

      React.useEffect(() => {
        if (filteredFiles.length > 0) {
          onAnswerChange({ fileId: filteredFiles[0].id, filename: filteredFiles[0].filename || filteredFiles[0].name });
        }
      }, [filteredFiles.length]);

      return (
        <div>
          <div
            {...getRootProps()}
            className={`w-full border-dashed border-2 px-4 py-6 rounded text-center cursor-pointer transition ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} name={name} />
            {filteredFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                  {filteredFiles[0].filename || filteredFiles[0].name || 'File'}
                  <button
                    type="button"
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                    disabled={deleting || uploading}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setDeleting(true);
                      setUploadError(null);
                      try {
                        await deleteTempUpload(filteredFiles[0].id);
                        const session_id = localStorage.getItem('session_id');
                        const data = await getTempUploads(session_id || '');
                        setUploadedFiles(Array.isArray(data) ? data : data.files || []);
                      } catch (err: any) {
                        setUploadError(err.message || 'Gagal menghapus file');
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    {deleting ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
                
                {/* File Preview */}
                <div className="flex justify-center">
                  {(() => {
                    const filename = filteredFiles[0].filename || filteredFiles[0].name || '';
                    const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
                    const isPdf = filename.match(/\.pdf$/i);
                    
                    if (isImage) {
                      return (
                        <div className="w-32 h-32 border rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={URL.createObjectURL(filteredFiles[0])}
                            alt={filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    } else if (isPdf) {
                      return (
                        <div className="w-32 h-32 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg shadow-sm">
                          <FiFileText className="w-16 h-16 text-red-500" />
                        </div>
                      );
                    } else {
                      return (
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                          <FiFile className="w-16 h-16 text-gray-400" />
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div className="text-sm text-gray-500">
                  {filteredFiles[0].filename || filteredFiles[0].name || 'File'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <FiImage className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-gray-500">
                  Tarik dan lepas file di sini, atau klik untuk memilih
                </p>
                <p className="text-xs text-gray-400">
                  Mendukung gambar (JPG, PNG, GIF) dan dokumen (PDF)
                </p>
              </div>
            )}
          </div>
          {uploading && <div className="text-blue-500 mt-2">Uploading...</div>}
          {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
        </div>
      );

    default:
      return (
        <input
          type="text"
          name={name}
          onChange={(e) => onAnswerChange({ value: e.target.value })}
          className="w-full border border-gray-300 py-2 px-3 rounded focus:ring focus:ring-blue-300"
          placeholder="Jawaban"
        />
      )
  }
}
