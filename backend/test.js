const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testServer() {

    console.log("Starting tests...");

    const publicKeyResponse = await axios.get(`${API_URL}/public-key`);
    const publicKey = publicKeyResponse.data;

    // Helper to encrypt passwords using the public key
    const crypto = require('crypto');
    function encrypt(password) {
        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(password)
        );
        return encryptedBuffer.toString('base64');
    }

    const testCases = [
        {
            name: "Create a new account (valid data)",
            endpoint: `${API_URL}/register`,
            method: "post",
            data: {
                email: "testuser@example.com",
                username: "testuser",
                password: encrypt("securePassword123"),
            },
            expectedStatus: 201,
        },
        {
            name: "Login with valid credentials",
            endpoint: `${API_URL}/login`,
            method: "post",
            data: {
                email: "testuser@example.com",
                password: encrypt("securePassword123"),
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
                password: encrypt("securePassword456"),
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
                password: encrypt("anotherSecurePassword"),
            },
            expectedStatus: 400,
        },
        {
            name: "Login with incorrect password",
            endpoint: `${API_URL}/login`,
            method: "post",
            data: {
                email: "testuser@example.com",
                password: encrypt("wrongPassword"),
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
                password: encrypt("securePassword789"),
            },
            expectedStatus: 400,
        },
        {
            name: "Login with non-existent email",
            endpoint: `${API_URL}/login`,
            method: "post",
            data: {
                email: "nonexistent@example.com",
                password: encrypt("irrelevantPassword"),
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
    console.log(jwt)
    const res = await axios['get'](`${API_URL}/account`, {
        headers: {
            "authorization": "Bearer " + encrypt(jwt)
        }
    });
    console.log(res.data)
}

testServer();