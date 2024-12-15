import axios from 'axios';
import forge from 'node-forge';

let didUploadResumeSinceAnalysis = false;
let didUploadJobDescSinceAnalysis = false;

//=========== James Goode ===========
//Checks if we can connect to the backend
async function getBackendStatus()
{
    if(useMock)
    {
        return { success: true, message: "Up and running!" };
    }
    try {
        const status = await axios.get('http://localhost:5000/api/status');
        return { success: true, message: status.data.message };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Automates logging in with backend
async function login(email, password) {
    localStorage.setItem("analysisResults", "");
    didUploadResumeSinceAnalysis = false;
    didUploadJobDescSinceAnalysis = false;
    if(useMock)
    {
        return await mockLogin(email, password);
    }
    try {
        const publicKeyResponse = await axios.get('http://localhost:5000/api/public-key');
        const { key: publicKey, keypairId } = publicKeyResponse.data;

        if (!publicKey || !keypairId) {
            throw new Error('Failed to retrieve public key or keypairId.');
        }

        const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);

        const encryptedPassword = forge.util.encode64(
            forgePublicKey.encrypt(password, 'RSA-OAEP', {
                md: forge.md.sha1.create(),
                mgf1: {
                    md: forge.md.sha1.create()
                }
            })
        );

        const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 }); //This second keypair is for safe transfer of jwt

        const response = await axios.post('http://localhost:5000/api/login', {
            email,
            password: encryptedPassword,
            keypairId,
            keyForJWT: forge.pki.publicKeyToPem(keypair.publicKey)
        });

        const token  = keypair.privateKey.decrypt(forge.util.decode64(response.data.token), 'RSA-OAEP', {
            md: forge.md.sha1.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });

        localStorage.setItem("jwt", token);
        return { success: true, token };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Automates signing up with backend
async function signup(email, username, password) {
    if(useMock)
    {
        return await mockSignup(email, username, password);
    }
    let passCheck = checkSecurePassword(password);
    if(!passCheck.valid)
    {
        return { success: false, message: passCheck.message };
    }
    try {
        const publicKeyResponse = await axios.get('http://localhost:5000/api/public-key');
        const { key: publicKey, keypairId } = publicKeyResponse.data;

        if (!publicKey || !keypairId) {
            throw new Error('Failed to retrieve public key or keypairId.');
        }

        const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);

        const encryptedPassword = forge.util.encode64(
            forgePublicKey.encrypt(password, 'RSA-OAEP', {
                md: forge.md.sha1.create(),
                mgf1: {
                    md: forge.md.sha1.create()
                }
            })
        );

        const response = await axios.post('http://localhost:5000/api/register', {
            email,
            password: encryptedPassword,
            username,
            keypairId,
        });

        return { success: true };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Gets the account info from backend
async function getAccountInfo() {
    if(useMock)
    {
        return await mockGetAccountInfo();
    }
    let jwt = localStorage.getItem("jwt");
    if(jwt)
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

            return { success: true, info: response.data};
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

//=========== James Goode ===========
//Automates uploading a resume with the backend
async function resumeUpload(resume) {
    if(useMock)
    {
        return await mockResumeUpload(resume);
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

            didUploadResumeSinceAnalysis = true;
        return { success: true };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Automates uploading a job description with the backend
async function jobDescriptionUpload(job_description) {
    if(useMock)
    {
        return await mockJobDescriptionUpload(job_description);
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

            didUploadJobDescSinceAnalysis = true;
        return { success: true };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Automates getting the currently uploaded data with the backend
async function getUploadedData() {
    if(useMock)
    {
        return await mockGetUploadedData();
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

            const response = await axios.get('http://localhost:5000/api/currently-uploaded-data', {        
                headers: {
                    authorization: `Bearer ${keypairId} ${encJWT}`
                }
            });

        return { success: true , data: response.data.data};
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Automates deleting the currently uploaded data with the backend
async function deleteUploadedData() {
    localStorage.setItem("analysisResults", "");
    if(useMock)
    {
        return await mockDeleteUploadedData();
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

            const response = await axios.delete('http://localhost:5000/api/currently-uploaded-data', {        
                headers: {
                    authorization: `Bearer ${keypairId} ${encJWT}`
                }
            });

        return { success: true , message: response.data.message};
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Gets the fit score among other things from backend
async function getDocumentMetrics() {
    if(!didUploadResumeSinceAnalysis || !didUploadJobDescSinceAnalysis)
    {
        let results = localStorage.getItem("analysisResults");
        console.log(results)
        if(!results)
        {
            return {success: false};
        }
        return JSON.parse(results);
    }
    if(useMock)
    {
        return await mockGetDocumentMetrics();
    }
    try {
        didUploadResumeSinceAnalysis = false;
        didUploadJobDescSinceAnalysis = false;
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

            const response = await axios.post('http://localhost:5000/api/fit-score', {mock: localStorage.getItem("useMockAI")}, {        
                headers: {
                    authorization: `Bearer ${keypairId} ${encJWT}`
                }
            });
            
            let results = { success: true , ...response.data};
            localStorage.setItem("analysisResults", JSON.stringify(results));
            window.location.reload();
        return results;
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//=========== James Goode ===========
//Util for redirecting if detected that user is not logged in
async function redirectIfNotLoggedIn(navigate)
{
    let loggedIn = (await getAccountInfo()).success;
    if(!loggedIn)
    {
        navigate("/");
    }
}

//=========== James Goode ===========
//Util for checking if a password is secure or not
function checkSecurePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/;
    const hasLowercase = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) {
        return { valid: false, message: "Password must be at least 8 characters long." };
    }
    if (!hasUppercase.test(password)) {
        return { valid: false, message: "Password must include at least one uppercase letter." };
    }
    if (!hasLowercase.test(password)) {
        return { valid: false, message: "Password must include at least one lowercase letter." };
    }
    if (!hasNumber.test(password)) {
        return { valid: false, message: "Password must include at least one number." };
    }
    if (!hasSpecialChar.test(password)) {
        return { valid: false, message: "Password must include at least one special character." };
    }

    return { valid: true, message: "Password is secure." };
}


//=========== James Goode ===========
//ALL of the below code is for mimicking the above operations as if connected to the server

let useMock = localStorage.getItem("useMock") === "yes";
if(!localStorage.getItem("users"))
{
    localStorage.setItem("users", JSON.stringify([{email: "mock@mock.com", user: "Mock", pass: "mockPass#"}]));
}
let mockUsers = JSON.parse(localStorage.getItem("users"));
if(!localStorage.getItem("uploadedData"))
{
    localStorage.setItem("uploadedData", JSON.stringify({}));
}
let mockData = JSON.parse(localStorage.getItem("uploadedData"));

setInterval(() => {
    let currentTime = Date.now();
    for(let item of Object.keys(mockData))
    {
        if(currentTime - mockData[item].uploadTime > 1800000)
        {
            delete mockData[item]
        }
    }
    localStorage.setItem("uploadedData", JSON.stringify(mockData));
}, 60000);

function setMocking(mocking)
{
    useMock = mocking;
    localStorage.setItem("useMock", mocking?"yes":"no")
}

async function mockLogin(email, password) {
    for(let user of mockUsers)
    {
        if(email.toLowerCase() === user.email.toLowerCase())
        {
            if(password === user.pass)
            {
                let jwt = Math.floor(10000*Math.random()).toString();
                localStorage.setItem("jwt", jwt);
                user.jwt = jwt;
                localStorage.setItem("users", JSON.stringify(mockUsers));
                return { success: true, token: jwt};
            }
            else
            {
                return { success: false, message: "Invalid email or password"};
            }
        }
    }
    return { success: false, message: "Invalid email or password"};
}

async function mockSignup(email, username, password) {
    for(let user of mockUsers)
    {
        if(email.toLowerCase() === user.email.toLowerCase() || username.toLowerCase() === user.user.toLowerCase())
        {
            return { success: false, message: "Email or username already exists"};
        }
    }

    let passcheck = checkSecurePassword(password);

    if(!passcheck.valid)
    {
        return { success: false, message: passcheck.message};
    }

    mockUsers.push({email, user:username, pass:password});
    localStorage.setItem("users", JSON.stringify(mockUsers));

    return { success: true, message: "User registered"};
}

async function mockGetAccountInfo()
{
    let jwt = localStorage.getItem("jwt");
    if(jwt)
    {
        for(let user of mockUsers)
        {
            if(user.jwt === jwt)
            {
                return { success: true, info: {username: user.user, email: user.email} };
            }
        }
    }
    return { success: false, message: "Not logged in" };
}

async function mockResumeUpload(resume) {
    let accountInfo = await mockGetAccountInfo();

    if(!accountInfo.success)
    {
        return accountInfo;
    }

    const allowedFileTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxFileSize = 2 * 1024 * 1024;

    if (!allowedFileTypes.includes(resume.type)) {
        return {success: false, message: "Invalid file type. Only PDF or DOCX files are allowed."};
    }

    if (resume.size > maxFileSize) {
        return {success: false, message: "File size exceeds the limit of 2MB."};
    }

    if(!mockData[accountInfo.info.email])
    {
        mockData[accountInfo.info.email] = {};
    }
    mockData[accountInfo.info.email].resumeText = "Mock resume text";
    mockData[accountInfo.info.email].uploadTime = Date.now();
    localStorage.setItem("uploadedData", JSON.stringify(mockData));
    didUploadResumeSinceAnalysis = true;
    return { success: true };
}

async function mockJobDescriptionUpload(job_description) {
    let accountInfo = await mockGetAccountInfo();

    if(!accountInfo.success)
    {
        return accountInfo;
    }

    if (job_description.length > 5000) {
        console.log("hello")
        return {success: false, message: "Job description exceeds character limit."};
    }

    if(!mockData[accountInfo.info.email])
    {
        mockData[accountInfo.info.email] = {};
    }
    mockData[accountInfo.info.email].jobDescription = job_description.trim();
    mockData[accountInfo.info.email].uploadTime = Date.now();
    localStorage.setItem("uploadedData", JSON.stringify(mockData));
    didUploadJobDescSinceAnalysis = true;
    return { success: true };
}

async function mockGetUploadedData()
{
    let accountInfo = await mockGetAccountInfo();

    if(!accountInfo.success)
    {
        return accountInfo;
    }

    let data = mockData[accountInfo.info.email];
    if(data)
    {
        return {success: true, data: data};
    }
    else
    {
        return {success: true, data: {}};
    }
}

async function mockDeleteUploadedData()
{
    let accountInfo = await mockGetAccountInfo();

    if(!accountInfo.success)
    {
        return accountInfo;
    }

    let data = mockData[accountInfo.info.email];
    if(data)
    {
        delete mockData[accountInfo.info.email];
        localStorage.setItem("uploadedData", JSON.stringify(mockData));
        return {success: true, message: "Data deleted"};
    }
    else
    {
        return {success: true, message: "No data to delete"};
    }
}

async function mockGetDocumentMetrics()
{
    try {
        let accountInfo = await mockGetAccountInfo();
        didUploadResumeSinceAnalysis = false;
        didUploadJobDescSinceAnalysis = false;

        let data = mockData[accountInfo.info.email];

        if(!data || !data.jobDescription || data.jobDescription.length === 0 || !data.resumeText || data.resumeText.length === 0)
        {
            throw new Error("Data not uploaded");
        }

        await (new Promise((res) => {
            setTimeout(() => {
                res();
            }, 1000);
        }));

        let results = {"success":true,"fitScore":85,"improvementSuggestions":[{"category":"skills","text":"Add more emphasis on familiarity with NoSQL databases, as it is mentioned in the job description."},{"category":"experience","text":"Highlight any experience with cloud platforms other than AWS, such as Azure or GCP, to align with the job requirements."},{"category":"skills","text":"Include specific mentions of problem-solving skills or examples that demonstrate these abilities."},{"category":"experience","text":"If possible, provide metrics or outcomes from experiences that showcase working in an agile development environment."},{"category":"formatting","text":"Ensure consistent formatting for bullet points, such as punctuation at the end of each bullet point, for better readability."}],"keywordsInJobDescription":["Software Developer","Java","Python","Backend Systems","APIs","Spring Boot","Django","Flask","SQL","NoSQL","AWS","Docker","Kubernetes","Problem-solving","Object-oriented programming","Agile"],"matchedKeywordsInResume":["Java","Python","Spring Boot","Django","Flask","AWS","Docker","Kubernetes","APIs","Object-Oriented Design","Agile"],"status":"success"};
        localStorage.setItem("analysisResults", JSON.stringify(results))
        window.location.reload();
        return results;
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

export {getBackendStatus, login, signup, getAccountInfo, resumeUpload, jobDescriptionUpload, getUploadedData, deleteUploadedData, getDocumentMetrics, redirectIfNotLoggedIn, checkSecurePassword, setMocking}