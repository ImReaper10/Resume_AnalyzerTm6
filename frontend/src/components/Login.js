import React, { useState } from "react";
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
        return { success: true, token };
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        return { success: false, message: errorMessage };
    }
}

//BELOW IS JUST A TEST PAGE TO SEE IF THE ABOVE WORKS PROPERLY
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            console.log("Login successful! Token:", result.token);
            localStorage.setItem("jwt", result.token);
        } else {
            console.error("Login failed:", result.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
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
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
