import axios from 'axios';
import forge from 'node-forge';

async function login(email, password) {
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

async function signup(email, username, password) {
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


export {login, signup, getAccountInfo, resumeUpload, jobDescriptionUpload, checkSecurePassword}