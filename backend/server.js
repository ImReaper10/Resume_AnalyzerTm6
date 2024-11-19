const express = require('express');
const multer = require('multer');
const fileType = require('file-type');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow all origins or configure specific ones

const port = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Multer setup for file upload
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  storage: multer.memoryStorage(), // Temporarily store files in memory
});

// Helper function to validate file type
const validateFileType = async (fileBuffer) => {
  const type = await fileType.fromBuffer(fileBuffer); // Use the correct method for `file-type` module
  return type && (type.mime === 'application/pdf' || type.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
};

// Endpoint for Resume Upload
app.post('/api/resume-upload', upload.single('resume_file'), async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded.',
        status: 'error',
      });
    }

    const isValidFileType = await validateFileType(file.buffer);

    if (!isValidFileType) {
      return res.status(400).json({
        error: 'Invalid file type. Only PDF or DOCX files are allowed.',
        status: 'error',
      });
    }

    res.status(200).json({
      message: 'Resume uploaded successfully.',
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while processing the file.',
      status: 'error',
    });
  }
});

// Global error handler for Multer file size errors
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File size exceeds the limit of 2MB.',
      status: 'error',
    });
  }
  next(err);  // Pass the error to the default error handler if it's not a Multer error
});

// Endpoint for Job Description Text Input
app.post('/api/job-description', (req, res) => {
  const { job_description } = req.body;

  if (!job_description || job_description.length > 5000) {
    return res.status(400).json({
      error: 'Job description exceeds character limit.',
      status: 'error',
    });
  }

  // Clean the text by removing extraneous whitespace
  const cleanedDescription = job_description.trim();

  res.status(200).json({
    message: 'Job description submitted successfully.',
    status: 'success',
  });
});

// Start the server and export it
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { app, server };  // Export both app and server
