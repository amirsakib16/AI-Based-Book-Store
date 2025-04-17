import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Customer.css"; 

const Customer = ({ setUsername }) => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email.trim()) return alert("Please enter your email");

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("customerId", data.customerId);
                navigate("/frontpage");
            } else {
                alert("Login failed");
            }
        } catch (error) {
            console.log("Error during login", error);
        }
    };


    return (
        <div className="customer-container">
            <div className="customerLOG">Customer Login</div>
            <input
                type="email"
                placeholder="Enter your email"
                className="input-box"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button className="login-btnC" onClick={handleLogin}>Log In</button>
            <Link to="/">
                <button className="back-btnC">Back</button>
            </Link>
        </div>
    );
};

export default Customer;
