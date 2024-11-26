import React, { useState } from "react";
import { checkSecurePassword, login, signup } from "../utils/networkmanager.js"
import "../styling/Signup.css";
import { useNavigate } from "react-router-dom";
import LoadingWheel from "./LoadingWheel.js";

//=========== Diego Velasquez Minaya and James Goode (assistance and styling) ===========
//The overall layout for the signup page and necessary checks
const Signup = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [failMessage, setFailMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFailMessage("");
        setLoading(true);
        const result = await signup(email, username, password);
        setLoading(false);
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
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&amp;display=swap"
            />
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
                <button type="submit" style={{marginRight: "10px"}} disabled={email.length === 0 || password.length === 0 || confirmPassword.length === 0 || password !== confirmPassword || !checkSecurePassword(password).valid}>
                    Sign Up
                </button>
                <button onClick={() => {navigate("/")}} type="button">
                    Go to Login
                </button>
                <br></br>
                <div style={{textAlign: "center"}}>
                    {loading &&
                        <LoadingWheel></LoadingWheel>
                    }
                </div>
            </form>
        </div>
    );
};

export default Signup;
