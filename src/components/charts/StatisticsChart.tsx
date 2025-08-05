'use client'

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie, Doughnut } from 'react-chartjs-2'
import { ChartData, TextAnalysis } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface StatisticsChartProps {
  data: ChartData
  questionTitle: string
  questionType: string
  totalResponses: number
  chartType?: 'bar' | 'pie' | 'doughnut'
  textAnalysis?: TextAnalysis
}

export default function StatisticsChart({
  data,
  questionTitle,
  totalResponses,
  chartType = 'bar',
  textAnalysis
}: StatisticsChartProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const processedData = useMemo(() => {
    if (!textAnalysis) return data;
    
    const textIndex = data.labels.indexOf('Jawaban Text');
    const filteredLabels = textIndex !== -1 ? data.labels.filter((_, index) => index !== textIndex) : data.labels;
    const filteredData = textIndex !== -1 ? data.datasets[0].data.filter((_, index) => index !== textIndex) : data.datasets[0].data;
    const filteredBackgroundColors = textIndex !== -1 ? data.datasets[0].backgroundColor.filter((_, index) => index !== textIndex) : data.datasets[0].backgroundColor;
    const filteredBorderColors = textIndex !== -1 ? data.datasets[0].borderColor.filter((_, index) => index !== textIndex) : data.datasets[0].borderColor;
    
    const newLabels = [...filteredLabels];
    const newData = [...filteredData];
    const newBackgroundColors = [...filteredBackgroundColors];
    const newBorderColors = [...filteredBorderColors];
    
    Object.entries(textAnalysis.top_responses).forEach(([response, count], index) => {
      newLabels.push(`"${response}"`);
      newData.push(count);
      const textColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      const colorIndex = index % textColors.length;
      newBackgroundColors.push(textColors[colorIndex]);
      newBorderColors.push(textColors[colorIndex]);
    });
    
    return {
      labels: newLabels,
      datasets: [{
        ...data.datasets[0],
        data: newData,
        backgroundColor: newBackgroundColors,
        borderColor: newBorderColors
      }]
    };
  }, [data, textAnalysis]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
              title: {
          display: true,
          text: questionTitle,
          font: {
            size: 16,
            weight: 'bold' as const
          },
          padding: {
            bottom: 20
          }
        },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed.y || context.parsed
            const percentage = totalResponses > 0 ? ((value / totalResponses) * 100).toFixed(1) : '0'
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    } : undefined
  }

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return <Pie data={processedData} options={options} />
      case 'doughnut':
        return <Doughnut data={processedData} options={options} />
      default:
        return <Bar data={processedData} options={options} />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{questionTitle}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Total: {totalResponses} responses</span>
        </div>
      </div>
      
      <div className="h-80">
        {renderChart()}
      </div>
      
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span className="font-medium">{showDetails ? 'Sembunyikan' : 'Tampilkan'} Detail Responses</span>
          <svg 
            className={`w-5 h-5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Detail Responses</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Choice</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">Count</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-600">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.labels.map((label, index) => {
                    const count = processedData.datasets[0].data[index]
                    const percentage = totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : '0'
                    const isTextResponse = label.startsWith('"') && label.endsWith('"')
                    return (
                      <tr key={index} className={`border-b border-gray-100 ${isTextResponse ? 'bg-blue-50' : ''}`}>
                        <td className="py-2 px-3 text-gray-800">
                          {isTextResponse ? (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {label}
                            </span>
                          ) : (
                            label
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-medium">{count}</td>
                        <td className="py-2 px-3 text-center text-gray-600">{percentage}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {textAnalysis && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Text Responses Analysis</h4>
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Text responses are now displayed as separate entries in the chart above. 
                  Each unique text response appears as a distinct data point with its own color.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{textAnalysis.total_text_responses}</div>
                    <div className="text-sm text-gray-600">Total Text Responses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{textAnalysis.unique_responses}</div>
                    <div className="text-sm text-gray-600">Unique Responses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {textAnalysis.total_text_responses > 0 
                        ? ((textAnalysis.unique_responses / textAnalysis.total_text_responses) * 100).toFixed(1)
                        : '0'
                      }%
                    </div>
                    <div className="text-sm text-gray-600">Uniqueness Rate</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Top Responses</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(textAnalysis.top_responses).map(([response, count]) => (
                        <span key={response} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          "{response}" ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Sample Responses</h5>
                    <div className="bg-white rounded border p-3">
                      <div className="space-y-2">
                        {textAnalysis.sample_responses.map((response, index) => (
                          <div key={index} className="text-sm text-gray-800 border-l-4 border-blue-500 pl-3">
                            "{response}"
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 