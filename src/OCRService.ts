import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { ocr } from '/src/llama-ocr-buffer'
// Remove the import of 'fs' and 'path' modules
//import { Buffer } from 'buffer'
// Set the worker source for pdfjs-dist
GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs'

interface OCRService {
  extractTextFromPDF: (pdfFile: File) => Promise<string>
}

const ocrService: OCRService = {
  extractTextFromPDF: async (pdfFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        if (!reader.result) {
          reject(new Error('Failed to read PDF file'))
          return
        }

        getDocument(reader.result).promise.then(async (pdfDocument) => {
          let fullText = ''
          for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
            const page = await pdfDocument.getPage(pageNumber)
            const viewport = page.getViewport({ scale: 1.5 })
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d') as CanvasRenderingContext2D
            canvas.height = viewport.height
            canvas.width = viewport.width

            const renderContext = {
              canvasContext: context,
              viewport: viewport
            }
            await page.render(renderContext).promise

            const image = canvas.toDataURL('image/jpeg')
            //const buffer = Buffer.from(image.split(',')[1], 'base64')
            //const blob = new Blob([buffer], { type: 'image/png' })
            //const tempFilePath = URL.createObjectURL(blob)

            const markdown = await ocr({
              fileBuffer: image,
              model: 'Llama-3.2-11B-Vision',
              apiKey: import.meta.env.VITE_APP_TOGETHER_API_KEY,
            })
            fullText += markdown + '\n'

            //URL.revokeObjectURL(tempFilePath) // Clean up the temporary file
          }

          resolve(fullText)
        }).catch((error) => {
          reject(error)
        })
      }
      reader.readAsArrayBuffer(pdfFile)
    })
  }
}

export default ocrService


