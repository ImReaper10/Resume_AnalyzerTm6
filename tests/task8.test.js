const request = require('supertest');
const { app, server } = require('../backend/server'); // Import both app and server

describe('API Tests', function() {
  it('should upload a valid resume file', async function() {
    const response = await request(app)
      .post('/api/resume-upload')
      .attach('resume_file', '../backend//test-files/valid-pdf.pdf'); // Adjust path to your test file

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Resume uploaded successfully.');
  });

  it('should reject an invalid file type', async function() {
    const response = await request(app)
      .post('/api/resume-upload')
      .attach('resume_file', '../backend/test-files/invalid-file.txt'); // A non-PDF, non-DOCX file

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid file type. Only PDF or DOCX files are allowed.');
  });

  it('should reject file size over 2MB', async function() {
    const response = await request(app)
      .post('/api/resume-upload')
      .attach('resume_file', '../backend//test-files/large-file.pdf'); // Ensure the file is > 2MB
  
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('File size exceeds the limit of 2MB');
  });

  it('should successfully submit a job description', async function() {
    const response = await request(app)
      .post('/api/job-description')
      .send({ job_description: 'This is a valid job description.' })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Job description submitted successfully.');
  });

  it('should reject job description exceeding 5000 characters', async function() {
    const longDescription = 'a'.repeat(5001); // Create a string longer than 5000 characters
    const response = await request(app)
      .post('/api/job-description')
      .send({ job_description: longDescription })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Job description exceeds character limit.');
  });
});

// Close the server after all tests are done
afterAll(() => {
  server.close();  // Close the server to avoid open handle preventing Jest from exiting
});
