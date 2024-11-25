import React, { useEffect, useState } from "react";
import { login , getAccountInfo} from "../utils/networkmanager.js";
import { useNavigate } from "react-router-dom";
import "../styling/Login.css";

//=========== Diego Velasquez Minaya and James Goode (assistance and styling) ===========
//The overall layout for the login page and necessary checks
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [showSignUpSuccess, setSignUpSuccess] = useState(false);
    const [failMessage, setFailMessage] = useState("");

    React.useEffect(() => {
        if(localStorage.getItem("signup") && localStorage.getItem("signup") === "yes")
        {
            localStorage.setItem("signup", "no");
            setSignUpSuccess(true);
        }
        getAccountInfo().then((account) => {
            if(account.success)
            {
                navigate("/upload");
            }
        });     
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFailMessage("");
        const result = await login(email, password);
        if (result.success) {
            console.log("Login successful! Token:", result.token);
            localStorage.setItem("jwt", result.token);
            navigate("/upload");
        } else {
            setFailMessage(result.message);
            console.error("Login failed:", result.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
            {showSignUpSuccess &&
                <h5 style={{color: "green"}}>Sign up successful! Please log in with your new credentials.</h5>
            }
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label style={{marginRight: "10px"}} htmlFor="email">Email:</label>
                    <input
                        type="email"
                        value={email}
                        placeholder="Email"
			            id="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label style={{marginRight: "10px"}} htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {failMessage &&
                    <div style={{marginTop: "5px", marginBottom: "10px"}}>
                        <em style={{color: "red"}}>{failMessage}</em>
                    </div>
                }
                <button type="submit" style={{marginRight: "10px"}} disabled={email.length === 0 || password.length === 0}>
                    Login
                </button>
                <button onClick={() => {navigate("/signup")}} type="button">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Login;
