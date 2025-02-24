import React, { useState } from 'react'
import FileUpload from './FileUpload'
import PDFViewer from './PDFViewer'
import ocrService from './OCRService'
const  apiUrl = 'http://localhost:5000/api/llm'
const App: React.FC = () => {
  const [pdfText, setPdfText] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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
      const response = await fetch(apiUrl, {
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

      const result = await response.json()
      console.log('API response:', result)
    } catch (error) {
      console.error('Error calling API:', error)
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
      </div>
    </div>
  )
}

export default App
