import React, { useState, useRef } from 'react';
import ocrService from './OCRService';

// Import assets
import Auditorlogo from './assets/Auditor_logo 1.svg';
import Auditoravatar from './assets/Auditor_avatar.svg';
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

const AuditorScreen: React.FC = () => {
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
  const handleFileChange = (file: File) => {
    setUploadedFile(file);
    setDocumentName(file.name);
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  // Extraction du texte du PDF via OCR
  const extractText = async () => {
    if (!uploadedFile) return;
    try {
      const text = await ocrService.extractTextFromPDF(uploadedFile);
      setOcrResults(text);
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  };

  const [selectedCompany, setSelectedCompany] = useState<string>('');

  const handleCompanySelection = (company: string) => {
    setSelectedCompany(company);
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Barre du haut */}
      <div className="bg-white p-4 rounded-md shadow-md w-full max-w-6xl flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src={Auditorlogo} alt="Auditor Logo" className="h-20 w-auto mr-4" />
       Morgan Maxwell - Finance Analyst
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">Eren Ling</span>
          <img src={Auditoravatar} alt="Auditor Avatar" className="w-20 h-20 rounded-full" />
          <ChevronDown className="w-6 h-6 text-gray-800 cursor-pointer transition-transform duration-200 hover:rotate-180" />
          <div className="relative">
            <Bell className="w-10 h-10 text-gray-800" />
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">25</span>
          </div>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full flex items-center">
            <Wallet className="mr-2" />
            Wallet
          </button>
        </div>
      </div>

      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mb-6">
      <h2 className="text-xl font-bold mb-2"></h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 text-left font-semibold">Company Selection</th>
              <th className="px-4 py-2 text-left font-semibold">Company Wallet</th>
              <th className="px-4 py-2 text-left font-semibold">Company Name</th>
              <th className="px-4 py-2 text-left font-semibold">Company Logo</th>
              <th className="px-4 py-2 text-left font-semibold">Global Credibility Score</th>
              <th className="px-4 py-2 text-left font-semibold">Audit Status</th>
            </tr>
          </thead>
            <tbody>
            {/* Luxury Real Estate */}
            <tr className="border-b border-gray-200 text-center">
              <td className="px-4 py-2">
              <input
                type="radio"
                name="company"
                value="luxury"
                checked={selectedCompany === "luxury"}
                onChange={() => setSelectedCompany("luxury")}
                className="h-3 w-3 text-blue-600"
              />
              </td>
              <td className="px-4 py-2">0x1234...abcd</td>
              <td className="px-4 py-2">Luxury Real Estate</td>
              <td className="px-4 py-2">
              <img src="src/assets/Company_11.svg" alt="Luxury Real Estate" className="h-16 w-auto mx-auto" />
              </td>
              <td className="px-4 py-2 text-green-600 font-bold text-lg">87%</td>
              <td className="px-4 py-2 text-orange-600 font-bold text-lg">Requested</td>
            </tr>

            {/* JYA Smith */}
            <tr className="text-center">
              <td className="px-4 py-2">
              <input
                type="radio"
                name="company"
                value="jya"
                checked={selectedCompany === "jya"}
                onChange={() => setSelectedCompany("jya")}
                className="h-3 w-3 text-blue-600"
              />
              </td>
              <td className="px-4 py-2">0x5678...efgh</td>
              <td className="px-4 py-2">AK</td>
              <td className="px-4 py-2">
              <img src="src//assets/Company_2 1@2x.png" alt="AK" className="h-16 w-auto mx-auto" />
              </td>
              <td className="px-4 py-2 text-green-600 font-bold text-lg">98%</td>
              <td className="px-4 py-2 text-green-600 font-bold text-lg">Accepted </td>
            </tr>
            </tbody>
        </table>
        <div className="flex justify-center mp-3">  <button className="bg-gray-400 hover:bg-gray-500 text-white py-1 px-3 rounded-full flex items-center">
            <Download className="mr-3" />
            Load Secret Ledger
          </button></div>
         
        
      </div>
  
    </section>


      
       {/* Automatic Secured Ledger Section */}
       <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mb-0">
          <h2 className="text-xl font-bold mb-4">Automatic Secured Ledger</h2>
          
          <div className="flex flex-wrap  items-center justify-between mb-4">
  <div className="flex items-center space-x-2">
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
                <>
                  <div>
                    <button
                      onClick={extractText}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                      <FileSearch className="mr-2" />
                      View doc.
                    </button>
                  
                    <div className="flex items-center mt-2">
                      {fingerprint === 'expectedFingerprintHash' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <span className="ml-0 text-gray-600 text-xs">
                      {fingerprint === 'expectedFingerprintHash' ? 'Fingerprint OK' : 'Fingerprint KO'}
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Copy className="h-6 w-6 text-gray-500 cursor-pointer" />
                      <span className="ml-2 text-gray-600 text-xs">
                      Copy Fingerprint
                      </span>
                    </div>
                  </div>
                </>
              )}
    <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
      <Share2 className="mr-2" />
      View BC Tx
    </button>
    <button className="bg-orange-400 hover:bg-orange-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
      <Edit className="mr-2" />
      Req correction
    </button>

    {/* SEAL in BC with Progress Loaders Below */}
    <div className="flex flex-wrap flex-col items-center">
      <button className="bg-green-500 hover:bg-green-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
        <CheckCircle className="mr-2" />
        Approve
      </button>
    </div>

    <button className="bg-red-500 hover:bg-red-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
      <XCircle className="mr-2" />
      Flag Issue
    </button>

    <div className="flex flex-wrap  items-center ml-auto">
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

export default AuditorScreen;
