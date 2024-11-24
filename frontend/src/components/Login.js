import React, { useEffect, useState } from "react";
import { login , getAccountInfo} from "../utils/networkmanager";
import { useNavigate } from "react-router-dom";

//BELOW IS JUST A TEST PAGE TO SEE IF THE ABOVE WORKS PROPERLY
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
        getAccountInfo().then((account) => {
            if(account.success)
            {
                navigate("/upload");
            }
        });
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            console.log("Login successful! Token:", result.token);
            localStorage.setItem("jwt", result.token);
            navigate("/upload");
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
