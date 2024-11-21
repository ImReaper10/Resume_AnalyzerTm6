const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api';


//THESE ARE ONLY TEMPORARY TESTS!!! WILL MAKE MORE RIGOROUS TESTS IN THE FUTURE

async function testServer() {

    console.log("Starting tests...");

    // Helper to encrypt passwords using the public key
    const crypto = require('crypto');
    async function encrypt(password) {
        const publicKeyResponse = await axios(`${API_URL}/public-key`);
        const publicKey = publicKeyResponse.data.key;
        const keypairId = publicKeyResponse.data.keypairId;
        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(password)
        );
        return keypairId + " " + encryptedBuffer.toString('base64');
    }

    async function encryptPassword(password) {
        const publicKeyResponse = await axios(`${API_URL}/public-key`);
        const publicKey = publicKeyResponse.data.key;
        const keypairId = publicKeyResponse.data.keypairId;
        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(password)
        );
        return {password: encryptedBuffer.toString('base64'), keypairId};
    }

    const testCases = [
        {
            name: "Create a new account (valid data)",
            endpoint: `${API_URL}/register`,
            method: "post",
            data: {
                email: "testuser@example.com",
                username: "testuser",
                ... await encryptPassword("securePassword12345$")
            },
            expectedStatus: 201,
        },
        {
            name: "Login with valid credentials",
            endpoint: `${API_URL}/login`,
            method: "post",
            data: {
                email: "testuser@example.com",
                ... await encryptPassword("securePassword12345$"),
            },
            expectedStatus: 200,
        },
        {
            name: "Try to create an account with an existing email",
            endpoint: `${API_URL}/register`,
            method: "post",
            data: {
                email: "testuser@example.com",
                username: "testuser2",
                ... await encryptPassword("securePassword456"),
            },
            expectedStatus: 400,
        },
        {
            name: "Try to create an account with an existing username",
            endpoint: `${API_URL}/register`,
            method: "post",
            data: {
                email: "anotheruser@example.com",
                username: "testuser",
                ... await encryptPassword("securePassword12345$"),
            },
            expectedStatus: 400,
        },
        {
            name: "Login with incorrect password",
            endpoint: `${API_URL}/login`,
            method: "post",
            data: {
                email: "testuser@example.com",
                ... await encryptPassword("wrongPassword"),
            },
            expectedStatus: 400,
        },
        {
            name: "Create account with invalid email",
            endpoint: `${API_URL}/register`,
            method: "post",
            data: {
                email: "notanemail",
                username: "invalidemailuser",
                ... await encryptPassword("securePassword12345$"),
            },
            expectedStatus: 400,
        },
        {
            name: "Login with non-existent email",
            endpoint: `${API_URL}/login`,
            method: "post",
            data: {
                email: "nonexistent@example.com",
                ... await encryptPassword("irrelevantPassword"),
            },
            expectedStatus: 400,
        },
        {
            name: "Create account with missing fields",
            endpoint: `${API_URL}/register`,
            method: "post",
            data: {
                email: "missingfields@example.com",
            },
            expectedStatus: 400,
        },
    ];

    //jwt
    let jwt = "";
    for (const testCase of testCases) {
        try {
            console.log(`Running: ${testCase.name}`);
            const response = await axios[testCase.method](testCase.endpoint, testCase.data);
            if (response.status === testCase.expectedStatus) {
                console.log(`✔ Passed: ${testCase.name}`);
                if(testCase.endpoint === `${API_URL}/login`)
                {
                    jwt = response.data.token;
                }
                console.log(response.message)
            } else {
                console.error(`✖ Failed: ${testCase.name} (Unexpected Status: ${response.status})`);
            }
        } catch (err) {
            if (err.response && err.response.status === testCase.expectedStatus) {
                console.log(`✔ Passed: ${testCase.name}`);
                console.log(err.message)
            } else {
                console.error(`✖ Failed: ${testCase.name}`);
                if (err.response) {
                    console.error(`  Status: ${err.response.status}`);
                    console.error(`  Data: ${JSON.stringify(err.response.data)}`);
                } else {
                    console.error(`  Error: ${err.message}`);
                }
            }
        }
    }
    
    const headers = {
        authorization: `Bearer ${await encrypt(jwt)}`,
    };
    console.log(jwt)
    const res = await axios['get'](`${API_URL}/account`, {
        headers: headers
    });
    console.log(res.data)

    const resumeTests = [
        {
            name: "Upload valid PDF",
            filePath: path.join(__dirname, './test-files/valid-pdf.pdf'),
            expectedStatus: 200,
        },
        {
            name: "Upload invalid file type",
            filePath: path.join(__dirname, './test-files/invalid-file.txt'),
            expectedStatus: 400,
        },
        {
            name: "Upload large PDF file",
            filePath: path.join(__dirname, './test-files/large-file.pdf'),
            expectedStatus: 400,
        },
    ];
    
    for (const test of resumeTests) {
        try {
            const fileBuffer = fs.readFileSync(test.filePath);
            console.log(`Running: ${test.name}`);
            const formData = new FormData();
            formData.append('resume_file', fileBuffer, path.basename(test.filePath));

            const headers = {
                authorization: `Bearer ${await encrypt(jwt)}`,
            };

            const response = await axios.post(`${API_URL}/resume-upload`, formData, {
                headers: {
                    ...headers,
                    ...formData.getHeaders(), // Include the form-data headers
                },
            });
    
            if (response.status === test.expectedStatus) {
                console.log(`✔ Passed: ${test.name}`);
            } else {
                console.error(`✖ Failed: ${test.name} (Unexpected Status: ${response.status})`);
            }
        } catch (err) {
            if (err.response && err.response.status === test.expectedStatus) {
                console.log(`✔ Passed: ${test.name}`);
            } else {
                console.error(`✖ Failed: ${test.name}`);
                if (err.response) {
                    console.error(`  Status: ${err.response.status}`);
                    console.error(`  Data: ${JSON.stringify(err.response.data)}`);
                } else {
                    console.error(`  Error: ${err.message}`);
                }
            }
        }
    }
   
    const jobDescriptionTests = [
        {
            name: "Submit valid job description",
            endpoint: `${API_URL}/job-description`,
            method: "post",
            data: {
                job_description: "This is a valid job description for testing.",
            },
            expectedStatus: 200,
        },
        {
            name: "Submit overly long job description",
            endpoint: `${API_URL}/job-description`,
            method: "post",
            data: {
                job_description: "A".repeat(5001), // Exceeds limit
            },
            expectedStatus: 400,
        },
    ];

    for (const testCase of jobDescriptionTests) {
        try {
            console.log(`Running: ${testCase.name}`);
            const headers = {
                authorization: `Bearer ${await encrypt(jwt)}`,
            };
            const response = await axios[testCase.method](testCase.endpoint, testCase.data, { headers });
            if (response.status === testCase.expectedStatus) {
                console.log(`✔ Passed: ${testCase.name}`);
            } else {
                console.error(`✖ Failed: ${testCase.name} (Unexpected Status: ${response.status})`);
            }
        } catch (err) {
            if (err.response && err.response.status === testCase.expectedStatus) {
                console.log(`✔ Passed: ${testCase.name}`);
            } else {
                console.error(`✖ Failed: ${testCase.name}`);
                if (err.response) {
                    console.error(`  Status: ${err.response.status}`);
                    console.error(`  Data: ${JSON.stringify(err.response.data)}`);
                } else {
                    console.error(`  Error: ${err.message}`);
                }
            }
        }
    }
}

testServer();
