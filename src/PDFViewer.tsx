import React, { useState } from 'react'

interface PDFViewerProps {
  pdfText: string
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfText }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Extracted Text</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">{pdfText}</pre>
    </div>
  )
}

export default PDFViewer
