import React, { useState } from 'react';
import { resumeUpload, jobDescriptionUpload } from '../utils/networkmanager';
import '../styling/ResumeUploadForm.css';

function ResumeUploadForm() {
    const [resume, setResume] = useState(null);
    const [description, setDescription] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setResume(file);
        setMessage('');
    };

    const handleDescriptionChange = (event) => {
        const input = event.target.value;
        setDescription(input);
        setCharCount(input.length);
        setMessage('');
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!resume) {
            setMessage('Please select a resume to upload.');
            return;
        }

        setUploading(true);

        try {
            const resumeResponse = await resumeUpload(resume);
            if (!resumeResponse.success) {
                setMessage(`Error uploading resume: ${resumeResponse.message}`);
                return;
            }

            const descriptionResponse = await jobDescriptionUpload(description);
            if (!descriptionResponse.success) {
                setMessage(`Error uploading job description: ${descriptionResponse.message}`);
                return;
            }

            setMessage('Resume and job description uploaded successfully!');
        } catch (error) {
            setMessage(`Unexpected error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Upload Your Resume and Job Description</h2>
            <form onSubmit={handleUpload}>
                <div className="form-field">
                    <label htmlFor="resume">Select Resume (PDF/DOCX):</label>
                    <input
                        type="file"
                        id="resume"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="description">Job Description:</label>
                    <textarea
                        id="description"
                        rows="5"
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder="Enter the job description..."
                        disabled={uploading}
                    />
                    <p className="character-count">
                        {charCount} characters
                    </p>
                </div>
                <button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
            {message && <p className="submission-message">{message}</p>}
        </div>
    );
}

export default ResumeUploadForm;
