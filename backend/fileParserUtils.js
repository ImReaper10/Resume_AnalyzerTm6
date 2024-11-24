const pdfParse = require('pdf-parse');
const officeParser = require('officeparser');

/**
 * Extracts text from a PDF file.
 * @param {Buffer} fileBuffer - The buffer of the PDF file.
 * @returns {Promise<string>} - The extracted text.
 */
async function extractTextFromPdf(fileBuffer) {
    try {
        const data = await pdfParse(fileBuffer);
        return data.text.replace(/ +/g, ' ').trim();
    } catch (error) {
        //console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

/**
 * Extracts text from a Docx file.
 * @param {Buffer} fileBuffer - The buffer of the PDF file.
 * @returns {Promise<string>} - The extracted text.
 */
async function extractTextFromDocx(fileBuffer) {
    try {
        const data = await officeParser.parseOfficeAsync(fileBuffer);
        return data.replace(/ +/g, ' ').trim();
    } catch (error) {
        //console.error('Error extracting text from Docx:', error);
        throw new Error('Failed to extract text from Docx');
    }
}

module.exports = { extractTextFromPdf, extractTextFromDocx};
