import React, { useState } from "react";
import { resumeUpload, jobDescriptionUpload, getAccountInfo} from "../utils/networkmanager";

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
        //I put this first, to make sure there is a valid JWT, just to prevent large amounts of extra data (like a whole PDF file) from being sent, if the JWT has expired or they are not signed in
        let accountInfo = await getAccountInfo();
        if(!accountInfo.success)
        {
            console.error("Not logged in");
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
                console.error("Upload failed:", result2.message);
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
