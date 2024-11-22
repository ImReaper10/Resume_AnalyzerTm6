import React, { useState } from "react";
import { login, signup } from "../utils/networkmanager"

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
            const result2 = await login(email, password);
            if(result2.success)
            {
                console.log("Sign in successful!");
            }
            else
            {
                console.error("Sign up failed:", result2.message);
            }
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
