import React, { useState } from 'react'
import FileUpload from './FileUpload'
import PDFViewer from './PDFViewer'
import ocrService from './OCRService'
import { Wallet, SecretNetworkClient } from "secretjs";
import { add_invoice, get_all_invoices, update_auditor } from './contract'
import { config } from './config'

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



const App: React.FC = () => {
  const [pdfText, setPdfText] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [credibilityScore, setCredibilityScore] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<ApiResponse[]>([])
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [auditorTransactionHash, setAuditorTransactionHash] = useState<string | null>(null)
  const [newAuditorAddress, setNewAuditorAddress] = useState<string>(myAddress_auditor)

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
      const response = await fetch(config.apiInvoiceUrl, {
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

  const callCredibilityApi = async () => {
    if (!pdfText || !apiResponse) return
    try {
      const response = await fetch(config.apiCredibilityUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: pdfText,
          accounting_row: apiResponse
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
  }

  const checkBalance = async () => {
    try {
      const { balance }  = await secretjs.query.bank.balance(
        {
          address: config.ownerAddress,
          denom: 'uscrt',
        }
      )

      setBalance(`I have ${Number(balance.amount) / 1e6} SCRT!`)

      type Result = {
          count: number;
      }
      
      const result = (await secretjs.query.compute.queryContract({
        contract_address: config.contractAddress,
        code_hash: config.codeHash,
        query: {get_count: {}},
      })) as Result
      console.log(result)
      
    } catch (error) {
      console.error('Error checking balance:', error)
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

  const sealOnBC = async () => {
    if (!apiResponse) return
    try {
      const invoice = {
        invoice_number: apiResponse.invoice_number,
        date: apiResponse.date,
        client_name: apiResponse.client_name,
        description: apiResponse.description,
        total_amount: apiResponse.total_amount.toString(),
        tax_amount: apiResponse.tax_amount.toString(),
        currency: apiResponse.currency,
        doc_hash: '', // Add appropriate value
        line_hash: '', // Add appropriate value
        auditors: '', // Add appropriate value
        credibility: credibilityScore?.toString() || '',
        audit_state: '', // Add appropriate value
      }

      const tx = await add_invoice(secretjs, invoice)
      setTransactionHash(tx.transactionHash)
      console.log('Invoice sealed on blockchain:', invoice)
    } catch (error) {
      console.error('Error sealing invoice on blockchain:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const result = await get_all_invoices(secretjs, wallet, 'permitName', config.contractAddress)
      console.log('Fetched invoices:', result)
      setInvoices(result)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const fetchInvoicesByAuditor = async () => {
    try {
      const result = await get_all_invoices(secretjs_auditor, wallet_auditor, 'permitName', config.contractAddress)
      console.log('Fetched invoices by auditor:', result)
      setInvoices(result)
    } catch (error) {
      console.error('Error fetching invoices by auditor:', error)
    }
  }

  const addAuditor = async () => {
    try {
      const tx = await update_auditor(secretjs, 0, newAuditorAddress)
      setAuditorTransactionHash(tx.transactionHash)
      console.log('Auditor added:', newAuditorAddress)
    } catch (error) {
      console.error('Error adding auditor:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center w-full">
      <div className="bg-white p-8 rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">PDF OCR Extractor</h1>
        <button
          onClick={checkBalance}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 mt-4"
        >
          Check Balance
        </button>
        <p className="mt-4">My Address: {myAddress}</p>
        {balance && <p className="mt-4">{balance}</p>}
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
          <>
            <table className="mt-4 w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Invoice Number</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Client Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
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
                      value={apiResponse.description}
                      onChange={(e) => handleInputChange(e, 'description')}
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
            <button
              onClick={callCredibilityApi}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mt-4"
            >
              Get Credibility Score
            </button>
            <button
              onClick={sealOnBC}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-4"
            >
              Seal on BC
            </button>
            {transactionHash && (
              <p className="mt-4">Transaction Hash: {transactionHash}</p>
            )}
            {auditorTransactionHash && (
              <p className="mt-4">Auditor Transaction Hash: {auditorTransactionHash}</p>
            )}
            <button
              onClick={fetchInvoices}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
            >
              Fetch Invoices
            </button>
            <button
              onClick={fetchInvoicesByAuditor}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
            >
              Fetch Invoices by Auditor
            </button>
            <input
              type="text"
              value={newAuditorAddress}
              onChange={(e) => setNewAuditorAddress(e.target.value)}
              placeholder="Enter new auditor address"
              className="w-full px-2 py-1 mt-4"
            />
            <button
              onClick={() => addAuditor()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-700 mt-4"
            >
              Update Auditor
            </button>
          </>
        )}
        {invoices.length > 0 && (
          <table className="mt-4 w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Invoice Number</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Client Name</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Total Amount</th>
                <th className="border border-gray-300 px-4 py-2">Tax Amount</th>
                <th className="border border-gray-300 px-4 py-2">Currency</th>
                <th className="border border-gray-300 px-4 py-2">Credibility</th>
                <th className="border border-gray-300 px-4 py-2">Doc hash</th>
                <th className="border border-gray-300 px-4 py-2">Line Hash</th>
                <th className="border border-gray-300 px-4 py-2">Auditors</th>
                <th className="border border-gray-300 px-4 py-2">Audit</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{invoice.invoice_number}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.client_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.description}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.total_amount}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.tax_amount}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.currency}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.credibility}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.doc_hash}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.line_hash}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.auditors}</td>
                  <td className="border border-gray-300 px-4 py-2">{invoice.audit_state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {credibilityScore !== null && (
          <table className="mt-4 w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Credibility Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">{credibilityScore}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App
