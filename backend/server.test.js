// server.test.js
import request from 'supertest';
import { expect } from 'chai';
import app from './server.js'; // Correct import

describe('API Tests', function() {
  it('should upload a valid resume file', async function() {
    const response = await request(app)
      .post('/api/resume-upload')
      .attach('resume_file', './test-files/valid-pdf.pdf'); // Adjust the path to a valid file

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Resume uploaded successfully.');
  });

  it('should reject an invalid file type', async function() {
    const response = await request(app)
      .post('/api/resume-upload')
      .attach('resume_file', './test-files/invalid-file.txt'); // A non-PDF, non-DOCX file

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Invalid file type. Only PDF or DOCX files are allowed.');
  });

  it('should reject file size over 2MB', async function() {
    const response = await request(app)
      .post('/api/resume-upload')
      .attach('resume_file', './test-files/large-file.pdf'); // Ensure the file is > 2MB
  
    expect(response.status).to.equal(400);  // Expecting 400 status
    expect(response.body.error).to.include('File size exceeds the limit of 2MB');  // Expect the specific error message
  });


  it('should successfully submit a job description', async function() {
    const response = await request(app)
      .post('/api/job-description')
      .send({ job_description: 'This is a valid job description.' })
      .set('Content-Type', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Job description submitted successfully.');
  });

  it('should reject job description exceeding 5000 characters', async function() {
    const longDescription = 'a'.repeat(5001); // Create a string longer than 5000 characters
    const response = await request(app)
      .post('/api/job-description')
      .send({ job_description: longDescription })
      .set('Content-Type', 'application/json');

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Job description exceeds character limit.');
  });
});
