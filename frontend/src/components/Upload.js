import React, { useState } from "react";
import axios from 'axios';
import forge from 'node-forge';

async function getAccountInfo() {
    let jwt = "";
    if(jwt = localStorage.getItem("jwt"))
    {
        try {
            const publicKeyResponse = await axios.get('http://localhost:5000/api/public-key');
            const { key: publicKey, keypairId } = publicKeyResponse.data;

            if (!publicKey || !keypairId) {
                throw new Error('Failed to retrieve public key or keypairId.');
            }

            const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);

            const encJWT = forge.util.encode64(
                forgePublicKey.encrypt(jwt, 'RSA-OAEP', {
                    md: forge.md.sha1.create(),
                    mgf1: {
                        md: forge.md.sha1.create()
                    }
                })
            );

            const response = await axios.get('http://localhost:5000/api/account', {
                headers: {
                    authorization: `Bearer ${keypairId} ${encJWT}`,
                }
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message;
            return { success: false, message: errorMessage };
        }
    }
    else
    {
        return { success: false, message: "Not logged in" };
    }
}

async function resumeUpload(resume) {
    let accountInfo = await getAccountInfo();
    if(!accountInfo.success)
    {
        return accountInfo;
    }
    try {
        const publicKeyResponse = await axios.get('http://localhost:5000/api/public-key');
            const { key: publicKey, keypairId } = publicKeyResponse.data;

            if (!publicKey || !keypairId) {
                throw new Error('Failed to retrieve public key or keypairId.');
            }

            const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);

            const encJWT = forge.util.encode64(
                forgePublicKey.encrypt(localStorage.getItem("jwt"), 'RSA-OAEP', {
                    md: forge.md.sha1.create(),
                    mgf1: {
                        md: forge.md.sha1.create()
                    }
                })
            );

            const formData = new FormData();
            formData.append('resume_file', resume); 

            const response = await axios.post('http://localhost:5000/api/resume-upload', formData, {
                headers: {
                    authorization: `Bearer ${keypairId} ${encJWT}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

        return { success: true };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

async function jobDescriptionUpload(job_description) {
    let accountInfo = await getAccountInfo();
    if(!accountInfo.success)
    {
        return accountInfo;
    }
    try {
        const publicKeyResponse = await axios.get('http://localhost:5000/api/public-key');
            const { key: publicKey, keypairId } = publicKeyResponse.data;

            if (!publicKey || !keypairId) {
                throw new Error('Failed to retrieve public key or keypairId.');
            }

            const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);

            const encJWT = forge.util.encode64(
                forgePublicKey.encrypt(localStorage.getItem("jwt"), 'RSA-OAEP', {
                    md: forge.md.sha1.create(),
                    mgf1: {
                        md: forge.md.sha1.create()
                    }
                })
            );

            const response = await axios.post('http://localhost:5000/api/job-description', {job_description}, {        
                headers: {
                    authorization: `Bearer ${keypairId} ${encJWT}`
                }
            });

        return { success: true };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//BELOW IS JUST A TEST PAGE TO SEE IF THE ABOVE WORKS PROPERLY
const Upload = () => {
    const [jobDescription, setJobDesc] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            console.error("Please select a file.");
            return;
        }
        const result = await resumeUpload(file);
        if (result.success) {
            console.log("Resume upload successful!");
            const result2 = await jobDescriptionUpload(jobDescription);
            if (result2.success) {
                console.log("Job description upload successful!");
            }
            else
            {
                console.error("Upload failed:", result.message);
            }
        } else {
            console.error("Upload failed:", result.message);
        }
    };

    return (
        <div>
            <h2>Upload</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Resume PDF: </label>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
                <label>Job Description: </label>
                <div>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDesc(e.target.value)}
                    />
                </div>
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default Upload;
