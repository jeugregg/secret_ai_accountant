import React, { useState, useRef, useEffect } from 'react';
import ocrService from './OCRService';
import { createFingerprint } from './CreateFingerprint'; 
import { config } from './config'
import CryptoJS from 'crypto-js';
// Import assets
import logo from './assets/Company_11.svg';
import avatar from './assets/Company_avatar.svg';
import fingerprintScanner from './assets/Fingerprint_scaner-1.svg';
import fingerprintScanner2 from './assets/Fingerprint_scaner-2.svg';
import {Wallet as WalletIcon} from 'lucide-react';
import {
  FileUp, FileSearch, FileText,
  FileSignature, Share2, RotateCcw, Copy, ChevronDown, Bell,
} from 'lucide-react';
import { Wallet, SecretNetworkClient } from "secretjs";
import { add_invoice, get_all_invoices, update_auditor } from './contract'
const MNEMONIC_ONWER = import.meta.env.VITE_APP_ONWER_MNEMONIC
const MNEMONIC_AUDITOR = import.meta.env.VITE_APP_AUDITOR_MNEMONIC

const wallet = new Wallet(MNEMONIC_ONWER)
const myAddress = wallet.address;
const secretjs = new SecretNetworkClient({
  url: config.urlLcd,
  chainId: config.chainId,
  wallet: wallet,
  walletAddress: myAddress,
});

const wallet_auditor = new Wallet(MNEMONIC_AUDITOR)
const myAddress_auditor = wallet_auditor.address;
const secretjs_auditor = new SecretNetworkClient({
  url: config.urlLcd,
  chainId: config.chainId,
  wallet: wallet_auditor,
  walletAddress: myAddress_auditor,
});
// Interface pour l'API
interface ApiResponsePrefill {
  invoice_number: string;
  date: string;
  client_name: string;
  description: string;
  total_amount: number;
  tax_amount: number;
  currency: string;
}
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

// Function to hash line data
const hashLinedata = (tableData: ApiResponsePrefill, fingerprint: string): string => {
  const dataString = `${tableData.invoice_number}${tableData.date}${tableData.client_name}${tableData.description}${tableData.total_amount}${tableData.tax_amount}${tableData.currency}${fingerprint}`;
  return CryptoJS.SHA256(dataString).toString(CryptoJS.enc.Hex);
};

const fetchCredibilityScore = async (ocrResults: string, tableData: ApiResponsePrefill) => {
  try {
    const response = await fetch(config.apiCredibilityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice: ocrResults,
        accounting_row: tableData
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    return result.credibility;
  } catch (error) {
    console.error('Error calling credibility API:', error);
    return null;
  }
};

const openFile = (file: File) => {
  const fileURL = URL.createObjectURL(file);
  window.open(fileURL, '_blank');
};

const CompanyScreen: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [ocrResults, setOcrResults] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [credibilityScore, setCredibilityScore] = useState(0);
  const [tableData, setTableData] = useState<ApiResponsePrefill>({
    invoice_number: '',
    date: '',
    client_name: '',
    description: '',
    total_amount: 0,
    tax_amount: 0,
    currency: '',
  });
  const [ledgerData, setLedgerData] = useState<BcResponse[]>([]);
  const [auditorAddress, setAuditorAddress] = useState(myAddress_auditor);
  const [auditorTransactionHash, setAuditorTransactionHash] = useState('');
  const [currentOperation, setCurrentOperation] = useState('');
  const [isSealing, setIsSealing] = useState(false);
  const [isAddingAuditor, setIsAddingAuditor] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [auditState, setAuditState] = useState<string>('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
    setUploadedFile(file);
    setDocumentName(file.name);
    setIsUploading(true);
    setCurrentOperation('Fingerprint');

    // Create fingerprint after file upload
    try {
      const fingerprint = await createFingerprint(file);
      setFingerprint(fingerprint);
      setCurrentOperation('OCR');
      // Extract text after creating fingerprint
      await extractText(file);
      setCurrentOperation('Prefill');
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

  // Handle table input changes
  const handleTableChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ApiResponse) => {
    const value = e.target.value;
    setTableData((prevData) => ({
      ...prevData,
      [field]: field === 'total_amount' || field === 'tax_amount' ? parseFloat(value) : value
    }));
  };

  const callApi = async () => {
    if (!ocrResults) return;
    try {
      const response = await fetch(config.apiInvoiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: ocrResults
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result: ApiResponsePrefill = await response.json();
      setTableData(result);
      setIsUploading(false);
      console.log('API response:', result);
    } catch (error) {
      console.error('Error calling API:', error);
      setIsUploading(false);
    }
  }
  
  const callCredibilityApi = async () => {
    if (!ocrResults || !tableData) return
    try {
      const response = await fetch(config.apiCredibilityUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: ocrResults,
          accounting_row: tableData
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      setCredibilityScore(result.credibility)
      console.log('Credibility API response:', result)
    } catch (error) {
      console.error('Error calling credibility API:', error)
    }
  };

  const sealOnBC = async () => {
    if (!tableData) return;
    setIsSealing(true);
    setCurrentOperation('Evaluating');
  
    try {
      // Fetch the credibility score directly
      const credibilityScore = await fetchCredibilityScore(ocrResults, tableData);
  
      if (credibilityScore === null) {
        console.error('Failed to fetch credibility score');
        return;
      }
  
      // hash the line data with : invoice_number, date, client_name, description, total_amount, tax_amount, currency
      const line_hash = hashLinedata(tableData, fingerprint);
  
      const invoice = {
        invoice_number: tableData.invoice_number,
        date: tableData.date,
        client_name: tableData.client_name,
        description: tableData.description,
        total_amount: tableData.total_amount.toString(),
        tax_amount: tableData.tax_amount.toString(),
        currency: tableData.currency,
        doc_hash: fingerprint,
        line_hash: line_hash,
        auditors: '',
        credibility: credibilityScore.toString(),
        audit_state: '',
      };
  
      setCurrentOperation('Broadcasting');
      const tx = await add_invoice(secretjs, invoice);
      console.log('Seal Transaction :', tx);
      console.log('Invoice sealed on blockchain:', invoice);
      setTransactionHash(tx.transactionHash);
  
      try {
        let result: BcResponse[] = await get_all_invoices(secretjs, wallet, 'permitName', config.contractAddress);
        console.log('Fetched invoices:', result);
  
        // Update the tx_hash of the result with tx.transactionHash
        result = result.map((invoice) => ({
          ...invoice,
          tx_hash: tx.transactionHash,
        }));
  
        // Update the Ledger Table with result
        setCredibilityScore(credibilityScore);
        setLedgerData(result);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    } catch (error) {
      console.error('Error sealing invoice on blockchain:', error);
    } finally {
      setIsSealing(false);
      setCurrentOperation('');
    }
  };
  

  const fetchInvoices = async () => {
    try {
      const result = await get_all_invoices(secretjs, wallet, 'permitName', config.contractAddress)
      console.log('Fetched invoices:', result)
      //setInvoices(result)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }
  const addAuditor = async () => {
    setIsAddingAuditor(true);
    try {
      const tx = await update_auditor(secretjs, 0, auditorAddress);
      setAuditorTransactionHash(tx.transactionHash);
      console.log('Auditor added:', auditorAddress);
      try {
        let result: BcResponse[] = await get_all_invoices(secretjs, wallet, 'permitName', config.contractAddress);
        console.log('Fetched invoices:', result);
        // Update the Ledger Table with result
        setLedgerData(result);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    } catch (error) {
      console.error('Error adding auditor:', error);
    } finally {
      setIsAddingAuditor(false);
    }
  };

  useEffect(() => {
    if (ocrResults) {
      callApi();
    }
  }, [ocrResults]);

  useEffect(() => {
    // Fetch the audit state from localStorage or any other storage mechanism
    const storedAuditState = localStorage.getItem('auditState');
    if (storedAuditState) {
      setAuditState(storedAuditState);
    }
  }, []);

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
            <div className="text-lg font-bold text-green-500">{credibilityScore}%</div>
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
            <WalletIcon className="mr-2" />
            Wallet
          </button>
        </div>
      </div>

      {/* Upload Document Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Invoice
          {isUploading && (
            <div className="flex items-center">
              <RotateCcw className="animate-spin h-5 w-5 text-blue-500" />
              <span className="ml-2 text-gray-600">
                {currentOperation === 'Fingerprint' && 'Creating Fingerprint...'}
                {currentOperation === 'OCR' && 'Extract Text by LLama Vision...'}
                {currentOperation === 'Prefill' && 'Prefill by Secret AI...'}
              </span>
            </div>
          )}
          </h2>
          
        </div>
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              disabled={isUploading || isSealing || isAddingAuditor}
            >
              <FileUp className="mr-2" />
              Upload doc.
            </button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />
            
            {uploadedFile && (
              <button
                onClick={() => openFile(uploadedFile)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              >
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg"
                  placeholder="/path/Document name"
                />
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
        {/* Editable Table Section */}
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-4">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {Object.keys(tableData).map((key) => (
                    <th key={key} className="py-2 px-4 border-b border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase">
                      {key.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.keys(tableData).map((key) => (
                    <td key={key} className="py-2 px-4 border-b border-gray-300">
                      <input
                        type="text"
                        value={tableData[key as keyof ApiResponsePrefill]}
                        onChange={(e) => handleTableChange(e, key as keyof ApiResponsePrefill)}
                        className="w-full py-1 px-2 border border-gray-300 rounded"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Automatic Secured Ledger Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mb-0">
        <h2 className="text-xl font-bold mb-4">Automatic Secured Ledger</h2>
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {/* SEAL in BC with Progress Loaders Below */}
            <div className="flex flex-wrap flex-col items-center">
              <button
                onClick={sealOnBC}
                className="bg-blue-600 hover:bg-blue-700 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                disabled={isUploading || isSealing || isAddingAuditor}
              >
                <FileSignature className="mr-2" />
                SEAL On Chain
              </button>

              {/* Rolling Progress Indicators */}
              <div className="flex flex-wrap space-x-2 mt-2">
                {isSealing && (
                  <>
                    <RotateCcw className="animate-spin h-7 w-7 text-blue-500" />
                    <span className="ml-2 text-gray-600">
                      {currentOperation === 'Evaluating' && 'Credibility by Secret AI...'}
                      {currentOperation === 'Broadcasting' && 'Broadcasting tx...'}
                    </span>
                  </>
                )}
              </div>
              {transactionHash && (
                <div className="mt-2">
                  <a
                    href={`${config.url_tx}${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center"
                  >
                    <FileText className="mr-1" />
                    Show Tx
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center ml-auto">
              {/* AI LLM Icon & Dynamic Credibility Score */}
              <img src="/src/assets/Ai_LLM.svg" alt="AI LLM" className="h-16 w-auto ml-20" />
              <span className="text-xl font-bold text-yellow-600 ml-2">
              {credibilityScore}% {/* This value should be dynamically updated */}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-1 rounded-lg shadow-md w-full max-w-6xl">
        <h2 className="text-xl font-bold mb-6"> Secured Ledger On Chain</h2>
        <div ref={scrollContainerRef} onWheel={handleScroll} className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-max border-collapse">
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
        <div className="flex justify-end mt-4 space-x-4">
          {isAddingAuditor && (
            <div className="flex items-center ml-2">
              <RotateCcw className="animate-spin h-5 w-5 text-purple-500" />
              <span className="ml-2 text-gray-600">Adding Auditor...</span>
            </div>
          )}
          {!isAddingAuditor && auditorTransactionHash && (
            <div className="mt-2">
              <a
                href={`${config.url_tx}${auditorTransactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                <FileText className="mr-1" />
                Show Tx
              </a>
            </div>
          )}
          <input
            type="text"
            placeholder="Enter Auditor Address"
            value={auditorAddress}
            className="border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-w-[400px]"
            onChange={(e) => setAuditorAddress(e.target.value)}
            disabled={isUploading || isSealing || isAddingAuditor}
          />
          <button 
            onClick={addAuditor}
            className="bg-purple-500 hover:bg-purple-600 text-white font-regular py-2 px-1 rounded inline-flex items-center transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            disabled={isUploading || isSealing || isAddingAuditor}
          >
            <Share2 className="mr-2" />
            Share with Auditor
          </button>
        </div>
      </section>
    </div>
  );
};

export default CompanyScreen;
