import React, { useState } from 'react';
import axios from 'axios';
import '../styling/ResumeUploadForm.css';

function ResumeUploadForm() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [fileError, setFileError] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const backendURL = "http://localhost:5000";

  // Handle file selection for resume
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
    setFileError('');
  };

  // Handle job description text input
  const handleJobDescriptionChange = (e) => {
    const value = e.target.value;
    setJobDescription(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage('');

    try {
      const formData = new FormData();
      formData.append('resume_file', resumeFile);

      // Upload the resume file
      await axios.post(`${backendURL}/api/resume-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Submit the job description
      await axios.post(`${backendURL}/api/job-description`, { job_description: jobDescription });

      setSubmissionMessage('Form submitted successfully!');
    } catch (error) {
      // Check if the error is from the backend and display it
      if (error.response && error.response.data && error.response.data.error) {
        setSubmissionMessage(error.response.data.error);
      } else {
        setSubmissionMessage('An error occurred while submitting the form.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Upload Resume & Enter Job Description</h2>
      <form onSubmit={handleSubmit}>
        {/* Resume Upload Field */}
        <div className="form-field">
          <input
            type="file"
            accept="*/*" // Accept all file types
            onChange={handleFileChange}
          />
          {fileError && <div className="error">{fileError}</div>}
        </div>

        {/* Job Description Field */}
        <div className="form-field">
          <textarea
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            placeholder="Enter job description"
          />
          {/* Display character count */}
          <div className="character-count">
            {jobDescription.length} characters
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting || !resumeFile}>Submit</button>
      </form>

      {/* Submission Message */}
      {submissionMessage && <div className="submission-message">{submissionMessage}</div>}
    </div>
  );
}

export default ResumeUploadForm;
