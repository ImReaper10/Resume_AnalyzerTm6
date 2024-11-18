const { PDFDocument } = require('pdf-lib');

/**
 * Extracts text from a PDF file.
 * @param {Buffer} fileBuffer - The buffer of the PDF file.
 * @returns {Promise<string>} - The extracted text.
 */
async function extractTextFromPdf(fileBuffer) {
    try {
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const pages = pdfDoc.getPages();
        let extractedText = '';

        for (const page of pages) {
            const pageText = await page.getTextContent();
            extractedText += pageText.items.map(item => item.str).join(' ');
        }

        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        return extractedText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

module.exports = { extractTextFromPdf };
