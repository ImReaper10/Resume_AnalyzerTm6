import React, { useState } from "react";
import axios from 'axios';
import forge from 'node-forge';

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

//BELOW IS JUST A TEST PAGE TO SEE IF THE ABOVE WORKS PROPERLY
const Signup = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await signup(email, username, password);
        if (result.success) {
            console.log("Sign up successful!");
        } else {
            console.error("Sign up failed:", result.message);
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default Signup;
