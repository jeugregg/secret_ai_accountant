import React, { useState } from 'react'
import FileUpload from './FileUpload'
import PDFViewer from './PDFViewer'
import ocrService from './OCRService'
import { Wallet, SecretNetworkClient, MsgSend, MsgMultiSend, stringToCoins } from "secretjs";
const apiInvoiceUrl = 'http://localhost:5000/api/invoice'
const apiCredibilityUrl = 'http://localhost:5000/api/credibility'
const owner_addr = "secret1hlk50xenk0rdlxzgth00ld09sp5jf2q0mlk05r"
const contract_addr = "secret1fu0jw5ery758xpdgv98rdr0v52uhd827k37g9c"
const code_hash = "f2bcfe74638d864143909ab6a02c9b5db81fd131f3bd4124b6a0f5ee88119f02"
const url_lcd = "https://pulsar.lcd.secretnodes.com"
const chain_id = "pulsar-3"
// get from env 
const MNEMONIC_ONWER = import.meta.env.VITE_APP_ONWER_MNEMONIC


const wallet = new Wallet(MNEMONIC_ONWER)
const myAddress = wallet.address;
const secretjs = new SecretNetworkClient({
  url: url_lcd,
  chainId: chain_id,
  wallet: wallet,
  walletAddress: myAddress,
});

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
  const [credibilityScore, setCredibilityScore] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

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

  const callCredibilityApi = async () => {
    if (!pdfText || !apiResponse) return
    try {
      const response = await fetch(apiCredibilityUrl, {
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
      //const secretjs = new SecretNetworkClient({
      //  url: url_lcd,
      //  chainId: chain_id,
      //})

      const { balance }  = await secretjs.query.bank.balance(
        {
          address: owner_addr,
          denom: 'uscrt',
        }
      )

      setBalance(`I have ${Number(balance.amount) / 1e6} SCRT!`)

      type Result = {
          count: number;
      }
      
      const result = (await secretjs.query.compute.queryContract({
        contract_address: contract_addr,
        code_hash: code_hash,
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
            <button
              onClick={callCredibilityApi}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mt-4"
            >
              Get Credibility Score
            </button>
          </>
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
