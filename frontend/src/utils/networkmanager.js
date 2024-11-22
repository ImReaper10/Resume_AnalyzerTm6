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

        const response = await axios.post('http://localhost:5000/api/login', {
            email,
            password: encryptedPassword,
            keypairId,
        });

        const { token } = response.data;
        localStorage.setItem("jwt", token);
        return { success: true, token };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

async function signup(email, username, password) {
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

export {login, signup, getAccountInfo, resumeUpload, jobDescriptionUpload}