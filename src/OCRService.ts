import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

// Set the worker source for pdfjs-dist
GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.js'

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

            const image = canvas.toDataURL('image/png')
            const tesseractResult = await Tesseract.recognize(image, 'eng', { logger: m => console.log(m) })
            fullText += tesseractResult.data.text + '\n'
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
