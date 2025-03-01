import React, { useState, useRef, useEffect } from 'react';
import ocrService from './OCRService';
import { createFingerprint } from './CreateFingerprint'; 
import { config } from './config'
// Import assets
import Auditorlogo from './assets/Auditor_logo 1.svg';
import Auditoravatar from './assets/Auditor_avatar.svg';
import avatar from './assets/Company_avatar.svg';
import fingerprintScanner from './assets/Fingerprint_scaner-1.svg';
import fingerprintScanner2 from './assets/Fingerprint_scaner-2.svg';
import {
  Wallet as WalletIcon, FileUp, FileSearch, FileText, Edit, CheckCircle, XCircle,
  FileSignature, Share2, RotateCcw, Copy, ChevronDown, Bell, Download, UploadCloud, Trash
} from 'lucide-react';
import { Wallet, SecretNetworkClient } from "secretjs";
import { add_invoice, get_all_invoices, update_auditor } from './contract'
const MNEMONIC_ONWER = import.meta.env.VITE_APP_ONWER_MNEMONIC
const wallet = new Wallet(MNEMONIC_ONWER)
const myAddress = wallet.address;
const MNEMONIC_AUDITOR = import.meta.env.VITE_APP_AUDITOR_MNEMONIC
const wallet_auditor = new Wallet(MNEMONIC_AUDITOR)
const myAddress_auditor = wallet_auditor.address;
const secretjs_auditor = new SecretNetworkClient({
  url: config.urlLcd,
  chainId: config.chainId,
  wallet: wallet_auditor,
  walletAddress: myAddress_auditor,
});

// Interface pour l'API
interface ApiResponse {
  invoice_number: string
  date: string
  client_name: string
  description: string
  total_amount: number
  tax_amount: number
  currency: string
  doc_hash: string
  line_hash: string
  auditors: string
  credibility: string
  audit_state: string
}

interface BcResponse {
  invoice_number: string
  date: string
  tx_hash: string
  doc_hash: string
  line_hash: string
  auditors: string
  credibility: string
  audit_state: string
  client_name: string
  description: string
  total_amount: number
  tax_amount: number
  currency: string
}

const AuditorScreen: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [ocrResults, setOcrResults] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [ledgerData, setLedgerData] = useState<BcResponse[]>([]);
  const [credibilityScore, setCredibilityScore] = useState<number>(0);
  const [fingerprintMatch, setFingerprintMatch] = useState<boolean | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false); // New state for broadcasting
  const [isFetching, setIsFetching] = useState(false); // New state for fetching

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const fetchInvoicesByAuditor = async () => {
    setIsFetching(true); // Set fetching state to true
    try {
      const result = await get_all_invoices(secretjs_auditor, wallet_auditor, 'permitName', config.contractAddress);
      console.log('Fetched invoices by auditor:', result);
      if (result.length > 0) {
        setLedgerData(result);
        setCredibilityScore(parseFloat(result[0].credibility));
      }
    } catch (error) {
      console.error('Error fetching invoices by auditor:', error);
    } finally {
      setIsFetching(false); // Set fetching state to false
    }
  };

  // Gère le scroll horizontal avec Shift + Molette
  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.shiftKey && scrollContainerRef.current) {
      event.preventDefault();
      scrollContainerRef.current.scrollLeft += event.deltaY * 2;
    }
  };

  // Gère l'upload du fichier
  const handleFileChange = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);
    setDocumentName(file.name);

    // Create fingerprint after file upload
    try {
      const fingerprint = await createFingerprint(file);
      setFingerprint(fingerprint);
      setIsUploading(false);
      // Extract text after creating fingerprint
    } catch (error) {
      setIsUploading(false);
      console.error('Error creating fingerprint or extracting text:', error);
    }
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

  const compareFingerprints = () => {
    if (!fingerprint || ledgerData.length === 0) return;
    const ledgerFingerprint = ledgerData[0].doc_hash; // Assuming the first entry for comparison
    setFingerprintMatch(fingerprint === ledgerFingerprint);
    console.log('Fingerprint Match:', fingerprint === ledgerFingerprint);
  };

  useEffect(() => {
    compareFingerprints();
  }, [fingerprint, ledgerData]);

  const [selectedCompany, setSelectedCompany] = useState<string>('');

  const handleCompanySelection = (company: string) => {
    setSelectedCompany(company);
  };

  const handleAuditAction = (action: string) => {
    if (ledgerData.length === 0) return;

    setIsBroadcasting(true); // Set broadcasting state to true

    // Simulate broadcasting time of 3 seconds
    setTimeout(() => {
      const updatedLedgerData = ledgerData.map((invoice) => {
        return { ...invoice, audit_state: action };
      });

      setLedgerData(updatedLedgerData);
      localStorage.setItem('auditState', action); // Store the audit state in localStorage
      setIsBroadcasting(false); // Set broadcasting state to false
    }, 3000);
  };

  useEffect(() => {
    if (tableRef.current) {
      const auditStateColumn = tableRef.current.querySelector('th:nth-child(12)');
      if (auditStateColumn) {
        auditStateColumn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  }, [ledgerData]);

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
            <WalletIcon className="mr-2" />
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
                <td className="px-4 py-2">{myAddress}</td>
                <td className="px-4 py-2">Luxury Real Estate</td>
                <td className="px-4 py-2">
                  <img src="src/assets/Company_11.svg" alt="Luxury Real Estate" className="h-16 w-auto mx-auto" />
                </td>
                <td className="px-4 py-2 text-green-600 font-bold text-lg">{credibilityScore}%</td>
                <td className="px-4 py-2 text-orange-600 font-bold text-lg">{ledgerData.find(invoice => invoice.invoice_number === selectedCompany)?.audit_state || 'Requested'}</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-center mp-3">
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white py-1 px-3 rounded-full flex items-center"
              onClick={fetchInvoicesByAuditor}
            >
              <Download className="mr-3" />
              Load Secret Ledger
            </button>
            {isFetching && (
              <div className="flex items-center ml-2">
                <RotateCcw className="animate-spin h-5 w-5 text-blue-500" />
                <span className="ml-2 text-gray-600">Fetching...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Automatic Secured Ledger Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mb-0">
        <h2 className="text-xl font-bold mb-4">Automatic Secured Ledger</h2>
        
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex flex-col items-start space-y-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                <FileUp className="mr-2" />
                Check doc.
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
                    <div className="flex items-center mt-2">
                      {fingerprintMatch === true ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : fingerprintMatch === false ? (
                      <XCircle className="h-6 w-6 text-red-500" />
                      ) : null}
                      <span className="ml-0 text-gray-600 text-xs">
                      {fingerprintMatch === true ? 'Fingerprint OK' : fingerprintMatch === false ? 'Fingerprint KO' : ''}
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Copy 
                        className="h-6 w-6 text-gray-500 cursor-pointer" 
                        onClick={() => copyToClipboard(fingerprint)} 
                      />
                      <span className="ml-2 text-gray-600 text-xs">
                        Copy Fingerprint
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="bg-orange-400 hover:bg-orange-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                onClick={() => handleAuditAction('req. corr.')}
              >
                <Edit className="mr-2" />
                Req correction
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                onClick={() => handleAuditAction('approve')}
              >
                <CheckCircle className="mr-2" />
                Approve
              </button>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                onClick={() => handleAuditAction('issue')}
              >
                <XCircle className="mr-2" />
                Flag Issue
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center ml-auto">
            {/* AI LLM Icon & Dynamic Credibility Score */}
            <img src="/src/assets/Ai_LLM.svg" alt="AI LLM" className="h-16 w-auto ml-20" />
            <span className="text-xl font-bold text-yellow-600 ml-2">
              {credibilityScore}%
            </span>
          </div>
        </div>
      </section>

      {/* Show broadcasting message */}
      {isBroadcasting && (
        <div className="flex items-center mt-2">
          <RotateCcw className="animate-spin h-5 w-5 text-blue-500" />
          <span className="ml-2 text-gray-600">Broadcasting...</span>
        </div>
      )}

      {/* Ledger Table avec Scroll Horizontal */}
      <section className="bg-white p-1 rounded-lg shadow-md w-full max-w-6xl">
        <h2 className="text-xl font-bold mb-6">Secured Ledger On Chain</h2>
        <div ref={scrollContainerRef} onWheel={handleScroll} className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
          <table ref={tableRef} className="min-w-max border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-md">
              <tr>
                {ledgerData.length > 0 && Object.keys(ledgerData[0]).map((header, index) => (
                  <th key={index} className="px-4 py-2 border-b border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    {header.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((invoice, rowIndex) => (
                <tr key={rowIndex} className="even:bg-gray-50">
                  {Object.values(invoice).map((value, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 mt-6 w-full">
        <p>Scrt Ai Acc : <a href="https://github.com/jeugregg/secret_ai_accountant" className="text-blue-500 hover:underline">GitHub Repository</a> - 2025 - Built by jeugregg & FredericAtlan</p>
      </footer>
    </div>
  );
};

export default AuditorScreen;
