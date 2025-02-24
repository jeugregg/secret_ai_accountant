import React, { useState } from 'react'
import FileUpload from './FileUpload'
import PDFViewer from './PDFViewer'
import ocrService from './OCRService'
const apiInvoiceUrl = 'http://localhost:5000/api/invoice'
const apiCredibilityUrl = 'http://localhost:5000/api/credibility'

interface ApiResponse {
  invoice_number: string
  date: string
  client_name: string
  type: string
  total_amount: number
  tax_amount: number
  currency: string
}

const App: React.FC = () => {
  const [pdfText, setPdfText] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  const handleFileChange = (file: File) => {
    setUploadedFile(file)
  }

  const extractText = async () => {
    if (!uploadedFile) return
    try {
      const text = await ocrService.extractTextFromPDF(uploadedFile)
      setPdfText(text)
    } catch (error) {
      console.error('Error extracting text:', error)
    }
  }

  const callApi = async () => {
    if (!pdfText) return
    try {
      const response = await fetch(apiInvoiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: pdfText
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result: ApiResponse = await response.json()
      setApiResponse(result)
      console.log('API response:', result)
    } catch (error) {
      console.error('Error calling API:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ApiResponse) => {
    if (apiResponse) {
      setApiResponse({
        ...apiResponse,
        [field]: e.target.value,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center w-full">
      <div className="bg-white p-8 rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">PDF OCR Extractor</h1>
        <FileUpload onFileChange={handleFileChange} />
        {uploadedFile && (
          <button
            onClick={extractText}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
          >
            Extract Text
          </button>
        )}
        {pdfText && <PDFViewer pdfText={pdfText} />}
        <button
          onClick={callApi}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-4"
        >
          Call API
        </button>
        {apiResponse && (
          <table className="mt-4 w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Invoice Number</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Client Name</th>
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Total Amount</th>
                <th className="border border-gray-300 px-4 py-2">Tax Amount</th>
                <th className="border border-gray-300 px-4 py-2">Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={apiResponse.invoice_number}
                    onChange={(e) => handleInputChange(e, 'invoice_number')}
                    className="w-full px-2 py-1"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={apiResponse.date}
                    onChange={(e) => handleInputChange(e, 'date')}
                    className="w-full px-2 py-1"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={apiResponse.client_name}
                    onChange={(e) => handleInputChange(e, 'client_name')}
                    className="w-full px-2 py-1"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={apiResponse.type}
                    onChange={(e) => handleInputChange(e, 'type')}
                    className="w-full px-2 py-1"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={apiResponse.total_amount}
                    onChange={(e) => handleInputChange(e, 'total_amount')}
                    className="w-full px-2 py-1"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={apiResponse.tax_amount}
                    onChange={(e) => handleInputChange(e, 'tax_amount')}
                    className="w-full px-2 py-1"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="text"
                    value={apiResponse.currency}
                    onChange={(e) => handleInputChange(e, 'currency')}
                    className="w-full px-2 py-1"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App
