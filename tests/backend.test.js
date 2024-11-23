const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const crypto = require('crypto');

const API_URL = 'http://localhost:5000/api';

// Helper function to encrypt password
async function encryptPassword(password) {
    const publicKeyResponse = await axios.get(`${API_URL}/public-key`);
    const publicKey = publicKeyResponse.data.key;
    const keypairId = publicKeyResponse.data.keypairId;
    const encryptedBuffer = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(password)
    );
    return { password: encryptedBuffer.toString('base64'), keypairId };
}

async function jwtKeyPair()
{
    return await (new Promise((res) => {
        crypto.generateKeyPair(
            "rsa",
            {
                modulusLength: 2048,
                publicExponent: 0x10001,
                publicKeyEncoding: { type: "spki", format: "pem" },
                privateKeyEncoding: { type: "pkcs8", format: "pem" },
            },
            (err, pubKey, privKey) => {
                if (err) {
                    console.error("Error generating key pair:", err);
                    res.status(400).json({ error: "Error generating key" });
                    return;
                }
                res({pub: pubKey, priv: privKey});
            }
        );
    }));

}

let validAccountUsername = crypto.randomBytes(4).toString('hex');
let validAccountEmail = validAccountUsername + "@test.com";

const accountTests = [
    {
        name: "Create a new account (valid data)",
        endpoint: `${API_URL}/register`,
        method: "post",
        data: async () => ({
            email: validAccountEmail,
            username: validAccountUsername,
            ...(await encryptPassword("securePassword12345$")),
        }),
        expectedStatus: 201,
    },
    {
        name: "Login with valid credentials",
        endpoint: `${API_URL}/login`,
        method: "post",
        data: async () => ({
            email: validAccountEmail,
            ...(await encryptPassword("securePassword12345$")),
        }),
        expectedStatus: 200,
    },
    {
        name: "Try to create an account with an insecure password",
        endpoint: `${API_URL}/register`,
        method: "post",
        data: async () => ({
            email: crypto.randomBytes(4).toString('hex') + "@test.com",
            username: "testuser2",
            ...(await encryptPassword("notsecure")),
        }),
        expectedStatus: 400,
        expectedInError: "Password must"
    },
    {
        name: "Try to create an account with an existing email",
        endpoint: `${API_URL}/register`,
        method: "post",
        data: async () => ({
            email: validAccountEmail,
            username: "testuser2",
            ...(await encryptPassword("securePassword456")),
        }),
        expectedStatus: 400,
    },
    {
        name: "Try to create an account with an existing username",
        endpoint: `${API_URL}/register`,
        method: "post",
        data: async () => ({
            email: crypto.randomBytes(4).toString('hex') + "@example.com",
            username: validAccountUsername,
            ...(await encryptPassword("securePassword12345$")),
        }),
        expectedStatus: 400,
    },
    {
        name: "Login with incorrect password",
        endpoint: `${API_URL}/login`,
        method: "post",
        data: async () => ({
            email: validAccountEmail,
            ...(await encryptPassword("wrongPassword")),
        }),
        expectedStatus: 400,
    },
    {
        name: "Create account with invalid email",
        endpoint: `${API_URL}/register`,
        method: "post",
        data: async () => ({
            email: "notanemail",
            username: "invalidemailuser",
            ...(await encryptPassword("securePassword12345$")),
        }),
        expectedStatus: 400,
    },
    {
        name: "Login with non-existent email",
        endpoint: `${API_URL}/login`,
        method: "post",
        data: async () => ({
            email: crypto.randomBytes(4).toString('hex') + "@example.com",
            ...(await encryptPassword("irrelevantPassword")),
        }),
        expectedStatus: 400,
    },
    {
        name: "Create account with missing fields",
        endpoint: `${API_URL}/register`,
        method: "post",
        data: async () => ({
            email: crypto.randomBytes(4).toString('hex') + "@example.com",
        }),
        expectedStatus: 400,
    },
];

describe('API Tests', () => {
    let jwt = '';

    console.log("Creating a user with email \"" + validAccountEmail + "\" for testing...");

    let accountRes = () => {};
    let accountCreated = new Promise((res) => {
        accountRes = res;
    });

    let accountLoggedInRes = () => {};
    let accountLoggedIn = new Promise((res) => {
        accountLoggedInRes = res;
    });

    describe('Account Management', () => {
        accountTests.forEach(testCase => {
            it(testCase.name, async () => {
                const data = await testCase.data();
                let keypair = {};
                if(testCase.name !== "Create a new account (valid data)")
                {
                    await accountCreated;
                }
                if(testCase.name.includes("Login"))
                {
                    keypair = await jwtKeyPair();
                    data["keyForJWT"] = keypair.pub;
                }
                try {
                    const response = await axios[testCase.method](testCase.endpoint, data);
                    expect(response.status).toBe(testCase.expectedStatus);
                    if(testCase.name === "Create a new account (valid data)")
                    {
                        accountRes();
                    }
                    else if (testCase.name.includes("Login")) {
                        jwt = crypto.privateDecrypt(
                            {
                                key: keypair.priv,
                                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
                            },
                            Buffer.from(response.data.token, "base64")
                        ); // Capture JWT for further tests
                        accountLoggedInRes();
                    }
                } catch (err) {
                    if (err.response) {
                        // console.log(testCase.name)
                        // console.log(err.response.data);
                        expect(err.response.status).toBe(testCase.expectedStatus);
                        if(testCase.expectedInError)
                        {
                            expect(err.response.data.error.indexOf(testCase.expectedInError) !== -1).toBe(true);
                        }
                    } else {
                        throw err;
                    }
                }
            });
        });
    });

    describe('Resume Uploads', () => {
        const resumeTests = [
            {
                name: "Upload valid PDF",
                filePath: path.join(__dirname, './test-files/valid-pdf.pdf'),
                expectedStatus: 200,
            },
            {
                name: "Upload valid DOCX",
                filePath: path.join(__dirname, './test-files/valid-docx.docx'),
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
            {
                name: "Upload large DOCX",
                filePath: path.join(__dirname, './test-files/large-docx.docx'),
                expectedStatus: 400,
            }
        ];

        resumeTests.forEach(testCase => {
            it(testCase.name, async () => {
                await accountLoggedIn;
                let encJWT = await encryptPassword(jwt);
                const fileBuffer = fs.readFileSync(testCase.filePath);
                const formData = new FormData();
                formData.append('resume_file', fileBuffer, path.basename(testCase.filePath));

                try {
                    const response = await axios.post(`${API_URL}/resume-upload`, formData, {
                        headers: {
                            authorization: `Bearer ${encJWT.keypairId} ${encJWT.password}`,
                            ...formData.getHeaders(),
                        },
                    });
                    expect(response.status).toBe(testCase.expectedStatus);
                } catch (err) {
                    if (err.response) {
                        expect(err.response.status).toBe(testCase.expectedStatus);
                    } else {
                        throw err;
                    }
                }
            });
        });
    });

    describe('Job Description Tests', () => {
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
                    job_description: "A".repeat(5001),
                },
                expectedStatus: 400,
            },
        ];

        jobDescriptionTests.forEach(testCase => {
            it(testCase.name, async () => {
                let encJWT = await encryptPassword(jwt);
                await accountLoggedIn;
                try {
                    const response = await axios[testCase.method](testCase.endpoint, testCase.data, {
                        headers: {
                            authorization: `Bearer ${encJWT.keypairId} ${encJWT.password}`,
                        },
                    });
                    expect(response.status).toBe(testCase.expectedStatus);
                } catch (err) {
                    if (err.response) {
                        expect(err.response.status).toBe(testCase.expectedStatus);
                    } else {
                        throw err;
                    }
                }
            });
        });
    });
});