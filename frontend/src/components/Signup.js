import React, { useState } from "react";
import { checkSecurePassword, login, signup } from "../utils/networkmanager.js"
import "../styling/Signup.css";
import { useNavigate } from "react-router-dom";

//=========== Diego Velasquez Minaya and James Goode (assistance and styling) ===========
//The overall layout for the signup page and necessary checks
const Signup = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [failMessage, setFailMessage] = useState("");

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFailMessage("");
        const result = await signup(email, username, password);
        if (result.success) {
            console.log("Sign up successful!");
            localStorage.setItem("signup", "yes")
            navigate("/");
        } else {
            setFailMessage(result.message)
            console.error("Sign up failed:", result.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Sign Up</h2>
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
                    <label style={{marginRight: "10px"}} htmlFor="username">Username:</label>
                    <input
                        type="text"
                        value={username}
                        placeholder="Username"
			            id="username"
                        onChange={(e) => setUsername(e.target.value)}
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
                    {password && !checkSecurePassword(password).valid &&
                        <div style={{marginTop: "10px"}}>
                            <em style={{color:"red"}}>{checkSecurePassword(password).message}</em>
                        </div>
                    }
                </div>
		        <div className="form-field">
                    <label style={{marginRight: "10px"}} htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        placeholder="Confirm password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    
                    {password && confirmPassword && password !== confirmPassword &&
                        <div style={{marginTop: "10px"}}>
                            <em style={{color:"red"}}>Passwords do not match</em>
                        </div>
                    }
                </div>
                <div style={{marginTop: "5px", marginBottom: "20px"}}>
                    <em>Password must be at least 8 characters long, include at least one lowercase letter, one uppercase letter, and a special character</em>
                </div>
                {failMessage &&
                    <div style={{marginTop: "5px", marginBottom: "10px"}}>
                        <em style={{color: "red"}}>{failMessage}</em>
                    </div>
                }
                <button type="submit" style={{marginRight: "10px"}} disabled={email.length === 0 || password.length === 0 || confirmPassword.length === 0 || password !== confirmPassword}>
                    Sign Up
                </button>
                <button onClick={() => {navigate("/")}} type="button">
                    Go to Login
                </button>
            </form>
        </div>
    );
};

export default Signup;
