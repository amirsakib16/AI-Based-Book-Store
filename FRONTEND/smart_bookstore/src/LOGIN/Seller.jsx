import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Seller.css";

const Seller = ({ setUsername }) => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email.trim()) return alert("Please enter your email");

        try {
            const response = await fetch("http://localhost:5000/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("sellerId", data.sellerId);
                navigate("/homepage");
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="seller-container">
            <div className="sellerLOG">Seller Login</div>
            <input
                type="email"
                placeholder="Enter your email"
                className="input-box"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button className="login-btnS" onClick={handleLogin}>Log In</button>
            <Link to="/">
                <button className="back-btnS">Back</button>
            </Link>
        </div>
    );
};

export default Seller;
