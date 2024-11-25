import React, { useState } from 'react';
import '../styling/View.css'; 
import { getUploadedData } from '../utils/networkmanager.js';

//=========== James Goode ===========
//The overall layout for the viewing page where you can view the uploaded resume and job description
function View() {
    const [data, setData] = useState({});
    React.useEffect(() => {
        getUploadedData().then((data) => {
            if(data.success)
            {
                setData(data.data);
            }
        });
    }, []);
    return (
        <div>
        {data.resumeText && data.jobDescription &&
            <div className="card" style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
                    <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid #ccc", paddingBottom: "8px" }}>Resume</h2>
                    <div className="displaytext">
                    {data.resumeText.split('\n').map((line, index) => (
                        <p key={index} style={{ margin: "4px 0" }}>
                        {line}
                        </p>
                    ))}
                    </div>
                </div>

                <div style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
                    <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid #ccc", paddingBottom: "8px" }}>Job Description</h2>
                    <div className="displaytext">
                    {data.jobDescription.split('\n').map((line, index) => (
                        <p key={index} style={{ margin: "4px 0" }}>
                        {line}
                        </p>
                    ))}
                    </div>
                </div>
            </div>
        }
        </div>
    );
}

export default View;