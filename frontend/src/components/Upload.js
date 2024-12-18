import React, { useState } from "react";
import { resumeUpload, jobDescriptionUpload, getAccountInfo, getUploadedData } from "../utils/networkmanager.js";
import "../styling/Upload.css";
import { useNavigate } from 'react-router-dom';
import { redirectIfNotLoggedIn } from '../utils/networkmanager.js';
import LoadingWheel from "./LoadingWheel.js";

//=========== Oscar Cotto and James Goode ===========
//Checks if a file is valid or not (such as 2mb or less)
function checkFileValidity(file)
{
    const ALLOWED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {success: false, message: "Invalid file type. Only PDF or DOCX files are allowed."};
    }

    if (file.size > MAX_FILE_SIZE) {
        return {success: false, message: "File size exceeds the limit of 2MB."};
    }

    return {success: true};

}

//=========== Oscar Cotto ===========
//Layout for uploading resumes and job descriptions and checking if they are the correct size and type
const Upload = () => {
    const [jobDescription, setJobDesc] = useState("");
    const [file, setFile] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    let navigate = useNavigate();

    React.useEffect(() => {
        redirectIfNotLoggedIn(navigate);
        getUploadedData().then((data) => {
            if(data.success)
            {
                if(Object.keys(data.data).length !== 0)
                {
                    navigate("/dashboard");
                }
            }
            else
            {
                setMessage(data.error);
            }
        });
    }, [navigate]);

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
                    navigate("/dashboard")
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
        const input = e.target.value==="sample text..."?"We are seeking a skilled Software Developer proficient in Java and Python to join our dynamic development team. The ideal candidate will design, develop, and maintain scalable backend systems and applications, leveraging the strengths of both programming languages. Responsibilities include building efficient APIs, integrating third-party libraries, implementing robust data-processing pipelines, and ensuring optimal application performance. Candidates should have experience with frameworks such as Spring Boot for Java and Django or Flask for Python, as well as familiarity with databases (SQL and NoSQL), cloud platforms (AWS, Azure, or GCP), and containerization tools like Docker and Kubernetes. Strong problem-solving skills, a solid understanding of object-oriented programming, and the ability to work in an agile development environment are essential.":e.target.value;
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
                    {file && !checkFileValidity(file).success &&
                        <em style={{color:"red"}}>{checkFileValidity(file).message}</em>
                    }
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
                    <p className="character-count" style={{color:`${jobDescription.length>5000?"red":"black"}`}}>
                        {charCount} characters
                    </p>
                </div>
                {message.length>0?
                    <p class="error">{message}</p>
                    :""}
                <button type="submit" disabled={uploading || !jobDescription.trim() || jobDescription.length>5000 || !file || !checkFileValidity(file).success}>
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </form>
            <div style={{textAlign: "center"}}>
                {uploading &&
                    <LoadingWheel></LoadingWheel>
                }
            </div>
        </div>
    );
};

export default Upload;
