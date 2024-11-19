const pdfParse = require('pdf-parse');

/**
 * Extracts text from a PDF file.
 * @param {Buffer} fileBuffer - The buffer of the PDF file.
 * @returns {Promise<string>} - The extracted text.
 */
async function extractTextFromPdf(fileBuffer) {
    try {
        const data = await pdfParse(fileBuffer);
        return data.text.replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

module.exports = { extractTextFromPdf };
