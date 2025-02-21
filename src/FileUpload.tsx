import React, { useState } from 'react'

interface FileUploadProps {
  onFileChange: (file: File) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [fileName, setFileName] = useState<string>('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileChange(file)
    }
  }

  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      {fileName && <p className="mt-1 text-green-600">Uploaded: {fileName}</p>}
    </div>
  )
}

export default FileUpload
