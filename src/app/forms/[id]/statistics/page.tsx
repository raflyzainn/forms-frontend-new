'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { getFormStatistics } from '@/lib/api'
import { StatisticsResponse } from '@/types'
import StatisticsChart from '@/components/charts/StatisticsChart'
import HomepageHeader from '@/components/common/HomepageHeader'
import html2canvas from 'html2canvas'

export default function FormStatisticsPage() {
  const params = useParams()
  const formId = params.id as string
  
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const [chartType, setChartType] = useState<'bar' | 'pie' | 'doughnut'>('bar')
  const [filterType, setFilterType] = useState<string>('all')
  
  const chartsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStatistics()
  }, [formId])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getFormStatistics(formId)
      setStatistics(response)
    } catch (err: any) {
      setError(err.message || 'Gagal memuat statistik')
      toast.error(err.message || 'Gagal memuat statistik')
    } finally {
      setLoading(false)
    }
  }

  const exportToImage = async () => {
    if (!chartsContainerRef.current) return
    
    try {
      setExporting(true)
      
      // Capture the charts container with simplified configuration
      const canvas = await html2canvas(chartsContainerRef.current, {
        backgroundColor: '#ffffff', // Use white background instead
        scale: 1.5, // Lower scale for better compatibility
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: true, // Remove temporary container
        foreignObjectRendering: false, // Disable foreign object rendering
        imageTimeout: 0, // No timeout for images
        onclone: (clonedDoc) => {
          // Add a simple style to override problematic colors
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * { 
              color: #000000 !important; 
              background-color: #ffffff !important; 
            }
            .chart-container { 
              background: #ffffff !important; 
            }
          `
          clonedDoc.head.appendChild(style)
        }
      })
      
      // Convert to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `statistics-${formId}-${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          toast.success('Statistics berhasil di-export!')
        }
      }, 'image/png')
      
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Gagal export statistics')
    } finally {
      setExporting(false)
    }
  }

  const exportSingleChart = async (chartElement: HTMLElement, questionTitle: string) => {
    try {
      setExporting(true)
      
      // Capture single chart with simplified configuration
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * { 
              color: #000000 !important; 
              background-color: #ffffff !important; 
            }
            .chart-container { 
              background: #ffffff !important; 
            }
          `
          clonedDoc.head.appendChild(style)
        }
      })
      
      // Convert to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          // Clean question title for filename
          const cleanTitle = questionTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
          link.download = `chart-${cleanTitle}-${formId}-${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          toast.success(`Chart "${questionTitle}" berhasil di-export!`)
        }
      }, 'image/png')
      
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Gagal export chart')
    } finally {
      setExporting(false)
    }
  }


  const filteredQuestions = statistics?.data.questions.filter(q => {
    if (filterType === 'all') return true
    return q.question_title === filterType
  }) || []

  const getChartTypeForQuestion = (questionTitle: string) => {
    switch (questionTitle) {
      case 'Single Choice':
      case 'Single Choice With Text':
        return 'pie'
      case 'Multiple Choice':
      case 'Multiple Choice With Text':
        return 'bar'
      default:
        return chartType
    }
  }

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomepageHeader isAdminPage={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomepageHeader isAdminPage={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchStatistics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomepageHeader isAdminPage={true} />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Statistik Form
          </h1>
          <p className="text-gray-600">
            {statistics?.data.form_title} • {statistics?.data.total_responses} total responses
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Tipe Pertanyaan
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="single_choice">Single Choice</option>
                <option value="single_choice_with_text">Single Choice with Text</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="multiple_choice_with_text">Multiple Choice with Text</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Chart Default
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'bar' | 'pie' | 'doughnut')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>

            <button
              onClick={fetchStatistics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>



        {/* Charts Grid */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada pertanyaan yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredQuestions.map((question) => (
              <div key={question.question_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {question.question_title}
                  </h3>
                  <button
                    onClick={() => {
                      const chartElement = document.querySelector(`[data-chart-id="${question.question_id}"]`) as HTMLElement
                      if (chartElement) {
                        exportSingleChart(chartElement, question.question_title)
                      }
                    }}
                    disabled={exporting}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {exporting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </>
                    )}
                  </button>
                </div>
                <div data-chart-id={question.question_id}>
                  <StatisticsChart
                    data={question.chart_data}
                    questionTitle={question.question_title}
                    questionType={question.question_type}
                    totalResponses={question.total_responses}
                    chartType={getChartTypeForQuestion(question.question_title)}
                    textAnalysis={question.text_analysis}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 