import React, { useState } from "react";
import { resumeUpload, jobDescriptionUpload, getAccountInfo } from "../utils/networkmanager";
import "../styling/Upload.css";

const Upload = () => {
    const [jobDescription, setJobDesc] = useState("");
    const [file, setFile] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!file) {
            setMessage("Please select a resume file.");
            return;
        }

        try {
            // Validate user authentication before proceeding
            let accountInfo = await getAccountInfo();
            if (!accountInfo.success) {
                setMessage("Not logged in. Please sign in first.");
                return;
            }

            setUploading(true);
            const resumeResult = await resumeUpload(file);
            if (resumeResult.success) {
                const descResult = await jobDescriptionUpload(jobDescription);
                if (descResult.success) {
                    setMessage("Resume and job description uploaded successfully!");
                } else {
                    setMessage(`Job description upload failed: ${descResult.message}`);
                }
            } else {
                setMessage(`Resume upload failed: ${resumeResult.message}`);
            }
        } catch (error) {
            setMessage(`Unexpected error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage("");
    };

    const handleDescriptionChange = (e) => {
        const input = e.target.value;
        setJobDesc(input);
        setCharCount(input.length);
    };

    return (
        <div className="form-container">
            <h2>Upload Your Resume and Job Description</h2>
            <form onSubmit={handleSubmit}>
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
                        value={jobDescription}
                        onChange={handleDescriptionChange}
                        placeholder="Enter the job description..."
                        disabled={uploading}
                    />
                    <p className="character-count">
                        {charCount} characters
                    </p>
                </div>
                <button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </form>
            {message && <p className="submission-message">{message}</p>}
        </div>
    );
};

export default Upload;
