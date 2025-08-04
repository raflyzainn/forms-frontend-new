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
  const [forceUpdate, setForceUpdate] = useState(0);

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
      // Handle null value properly - show empty string in input but send null to backend
      const otherText = answer?.value !== null && answer?.value !== undefined ? answer.value : '';

      const handleCheckboxChange = (choiceId: string) => {
        const newChoices = selectedChoices.includes(choiceId)
          ? selectedChoices.filter((id: string) => id !== choiceId)
          : [...selectedChoices, choiceId];
        onAnswerChange({ choiceIds: newChoices, value: otherText });
      };

      const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Send null if text is empty, otherwise send the text value
        const textValue = e.target.value.trim() === '' ? null : e.target.value;
        onAnswerChange({ choiceIds: selectedChoices, value: textValue });
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
      // Handle null value properly - show empty string in input but send null to backend
      const textValue = answer?.value !== null && answer?.value !== undefined ? answer.value : '';
      
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
            value={textValue}
            onChange={readOnly ? undefined : (e) => {
              // Send null if text is empty, otherwise send the text value
              const newTextValue = e.target.value.trim() === '' ? null : e.target.value;
              onAnswerChange({ ...answer, value: newTextValue, choiceId: null });
            }}
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
        
        // Always check for temp uploads first (prioritize new uploads)
        getTempUploads(session_id)
          .then((data) => {
            const tempFiles = Array.isArray(data) ? data : data.files || [];
            const relevantTempFiles = tempFiles.filter(
              (file: any) => file.form_id === formId && file.question_id === question.questionId
            );
            
            if (relevantTempFiles.length > 0) {
              // If there are temp uploads for this question, use them (new uploads)
              console.log('Using temp uploads:', relevantTempFiles);
              setUploadedFiles(tempFiles);
            } else if (answer?.documents && Array.isArray(answer.documents) && answer.documents.length > 0) {
              // If no temp uploads but have existing documents, use existing documents
              console.log('Using existing documents:', answer.documents);
              const existingDocs = answer.documents.map((doc: any) => ({
                id: doc.document_id || doc.id,
                filename: doc.file_name || doc.filename || doc.name,
                name: doc.file_name || doc.filename || doc.name,
                path: doc.path || doc.document_path,
                form_id: formId,
                question_id: question.questionId,
                isExisting: true // Flag to identify existing documents
              }));
              setUploadedFiles(existingDocs);
            } else {
              // No temp uploads and no existing documents
              setUploadedFiles([]);
            }
          })
          .catch((err) => {
            console.error('Error loading temp uploads:', err);
            // Fallback to existing documents if temp upload loading fails
            if (answer?.documents && Array.isArray(answer.documents) && answer.documents.length > 0) {
              const existingDocs = answer.documents.map((doc: any) => ({
                id: doc.document_id || doc.id,
                filename: doc.file_name || doc.filename || doc.name,
                name: doc.file_name || doc.filename || doc.name,
                path: doc.path || doc.document_path,
                form_id: formId,
                question_id: question.questionId,
                isExisting: true
              }));
              setUploadedFiles(existingDocs);
            }
            setUploadError(err.message || 'Gagal mengambil file');
          });
      }, [question.questionId, answer?.documents, formId]);

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
            const files = Array.isArray(data) ? data : data.files || [];
            setUploadedFiles(files);
            setForceUpdate(prev => prev + 1); // Force re-render
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
          const documents = filteredFiles.map(file => {
            if (file.path || file.isExisting) {
              // Existing document - keep as object with document_id
              return {
                document_id: file.id,
                file_name: file.filename || file.name,
                path: file.path
              };
            } else {
              // New upload - return as string ID for temp upload
              return file.id;
            }
          });
          
          onAnswerChange({ documents });
        } else {
          // Clear documents if no files
          onAnswerChange({ documents: [] });
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
                {filteredFiles.map((file, index) => (
                  <div key={`${file.id}-${file.filename}-${index}-${forceUpdate}`} className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                      {file.filename || file.name || 'File'}

                    </div>
                
                {/* File Preview */}
                <div className="flex justify-center">
                  {(() => {
                    const filename = file.filename || file.name || '';
                    const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
                    const isPdf = filename.match(/\.pdf$/i);
                    
                    // Check if this is an existing document (has path) or new upload
                    const isExistingDocument = file.path || file.isExisting;
                    let fileUrl: string;
                    
                    if (isExistingDocument) {
                      // Existing document - use API URL
                      fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/${file.id}/download`;
                    } else {
                      // New upload - check if it's a File object
                      if (file instanceof File) {
                        fileUrl = URL.createObjectURL(file);
                      } else {
                        // Fallback for non-File objects
                        fileUrl = '';
                      }
                    }
                    
                    if (isImage && fileUrl) {
                      return (
                        <div className="w-32 h-32 border rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={fileUrl}
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
                  {file.filename || file.name || 'File'}
                </div>
                
                {/* Download button for existing documents */}
                {(file.path || file.isExisting) && (
                  <div className="flex justify-center">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${file.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition text-sm"
                    >
                      <FiDownload className="inline-block" />
                      Download
                    </a>
                  </div>
                )}
                
                {/* Delete button for new uploads */}
                {!(file.path || file.isExisting) && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded shadow hover:bg-red-200 transition text-sm"
                      disabled={deleting || uploading}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setDeleting(true);
                        setUploadError(null);
                        try {
                          await deleteTempUpload(file.id);
                          const session_id = localStorage.getItem('session_id');
                          const data = await getTempUploads(session_id || '');
                          const files = Array.isArray(data) ? data : data.files || [];
                          setUploadedFiles(files);
                          setForceUpdate(prev => prev + 1); // Force re-render
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
                )}
              </div>
            ))}
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
