import React, { useState, useRef } from 'react';
import ocrService from './OCRService';
import { createFingerprint } from './CreateFingerprint'; 

// Import assets
import logo from './assets/Company_11.svg';
import avatar from './assets/Company_avatar.svg';
import fingerprintScanner from './assets/Fingerprint_scaner-1.svg';
import fingerprintScanner2 from './assets/Fingerprint_scaner-2.svg';
import {
  Wallet, FileUp, FileSearch, FileText, Edit, CheckCircle, XCircle,
  FileSignature, Share2, RotateCcw, Copy, ChevronDown, Bell, Download, UploadCloud, Trash
} from 'lucide-react';

// Interface pour l'API
interface ApiResponse {
  invoice_number: string;
  date: string;
  client_name: string;
  type: string;
  total_amount: number;
  tax_amount: number;
  currency: string;
}

const CompanyScreen: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [ocrResults, setOcrResults] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Gère le scroll horizontal avec Shift + Molette
  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.shiftKey && scrollContainerRef.current) {
      event.preventDefault();
      scrollContainerRef.current.scrollLeft += event.deltaY * 2;
    }
  };

  // Gère l'upload du fichier
  const handleFileChange = async (file: File) => {
    setUploadedFile(file);
    setDocumentName(file.name);
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);

    // Create fingerprint after file upload
    try {
      const fingerprint = await createFingerprint(file);
      setFingerprint(fingerprint);
      // Extract text after creating fingerprint
      await extractText(file);
    } catch (error) {
      console.error('Error creating fingerprint or extracting text:', error);
    }
  };

  // Extraction du texte du PDF via OCR
  const extractText = async (file: File) => {
    try {
      const text = await ocrService.extractTextFromPDF(file);
      setOcrResults(text);
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Barre du haut */}
      <div className="bg-white p-4 rounded-md shadow-md w-full max-w-6xl flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src={logo} alt="Company Logo" className="h-20 w-auto mr-4" />
          <div className="bg-white rounded-lg p-1 text-center">
            <div className="text-gray-900 px-2">Luxury Real Estate</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-1 text-center">
            <div className="text-gray-900 text-xs">Global Credibility Score</div>
            <div className="text-lg font-bold text-green-500">87%</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">Oscar Davis</span>
          <img src={avatar} alt="User Avatar" className="w-20 h-20 rounded-full" />
          <ChevronDown className="w-6 h-6 text-gray-800 cursor-pointer transition-transform duration-200 hover:rotate-180" />
          <div className="relative">
            <Bell className="w-10 h-10 text-gray-800" />
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">3</span>
          </div>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center">
            <Wallet className="mr-2" />
            Wallet
          </button>
        </div>
      </div>

      {/* Upload Document Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mb-6">
        <h2 className="text-xl font-bold mb-4">Upload Document</h2>
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
              <FileUp className="mr-2" />
              Upload doc.
            </button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />
            {isUploading && (
              <div className="flex items-center mt-2">
                <RotateCcw className="animate-spin h-5 w-5 text-blue-500" />
                <span className="ml-2 text-gray-600">Uploading...</span>
              </div>
            )}
            {uploadedFile && (
              <button
                onClick={() => extractText(uploadedFile)}
                className="bg-blue-500 hover:bg-blue-600 text-white ffont-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                <FileSearch className="mr-2" />
                View doc.
              </button>
            )}
          </div>
          <div className="col-span-3">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="document">
                Document
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="document"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg" // Increased font size
                  placeholder="/path/Document name"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FileSearch className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bg-white p-0.5 rounded-lg mb-8"></div>
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1 flex justify-center items-center">
            <img src={fingerprintScanner} alt="finger-icon" className="h-16 w-auto mr-4" /> {/* Updated logo */}
          </div>
          <div className="col-span-3">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fingerprint">
                Fingerprint
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="fingerprint"
                  value={fingerprint}
                  readOnly
                  className="bg-gray-50 border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg" // Improved styling
                  placeholder="Hash"
                />
                <button
                  onClick={() => copyToClipboard(fingerprint)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Copy className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1 flex justify-center items-center">
            <img src={fingerprintScanner2} alt="OCR icon" className="h-16 w-auto mr-4" /> {/* Updated logo */}
          </div>
          <div className="col-span-3">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 text-sm font-bold" htmlFor="ocr">
                  OCR
                </label>
                <div className="w-1/4 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div className="relative flex items-center">
                <textarea
                  id="ocr"
                  value={ocrResults}
                  readOnly
                  className="bg-gray-50 border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 text-lg" // Improved styling
                  placeholder="OCR Results"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-0">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automatic Secured Ledger Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mb-0">
        <h2 className="text-xl font-bold mb-4">Automatic Secured Ledger</h2>
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
              <Edit className="mr-2" />
              Edit
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
              <CheckCircle className="mr-2" />
              Approve
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
              <XCircle className="mr-2" />
              Delete line
            </button>

            {/* SEAL in BC with Progress Loaders Below */}
            <div className="flex flex-wrap flex-col items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                <FileSignature className="mr-2" />
                SEAL in BC
              </button>

              {/* Rolling Progress Indicators */}
              <div className="flex flex-wrap space-x-2 mt-2">
                {true && <RotateCcw className="animate-spin h-7 w-7 text-blue-500" />}
              </div>
            </div>

            <button className="bg-purple-500 hover:bg-purple-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
              <Share2 className="mr-2" />
              Share with Auditor
            </button>

            <div className="flex flex-wrap items-center ml-auto">
              {/* AI LLM Icon & Dynamic Credibility Score */}
              <img src="/src/assets/Ai_LLM.svg" alt="AI LLM" className="h-16 w-auto ml-20" />
              <span className="text-xl font-bold text-yellow-600 ml-2">
                54% {/* This value should be dynamically updated */}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ledger Table avec Scroll Horizontal */}
      <section className="bg-white p-1 rounded-lg shadow-md w-full max-w-6xl">
        <h2 className="text-xl font-bold mb-6"></h2>
        <div ref={scrollContainerRef} onWheel={handleScroll} className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-max border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-md">
              <tr>
                {[
                  "Selection", "Company Wallet", "Accounting Line ID", "Date", "Ref.",
                  "Supplier", "Description", "Amount (Excl. Tax)", "VAT (18%)",
                  "Total (Incl. Tax)", "Document Hash", "Accounting Line Hash",
                  "Secret Ledger Status", "Blockchain Transaction", "Credibility Score",
                  "Auditor Wallet", "Audit Progress", "Audit Decision"
                ].map((header, index) => (
                  <th key={index} className="px-4 py-2 border-b border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 1 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="even:bg-gray-50">
                  {Array.from({ length: 18 }).map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      {`Data ${rowIndex + 1}-${colIndex + 1}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CompanyScreen;
