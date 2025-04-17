import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../CSS/HomePage.css";

const HomePage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({ firstName: "", lastName: "", email: "", address: "", mobileNumber: "" });

    useEffect(() => {
        const sellerId = localStorage.getItem("sellerId"); // ✅ Updated key to match customerId pattern

        if (sellerId) {
            fetch(`http://localhost:5000/api/seller/${sellerId}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        setUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, address: data.address, mobileNumber: data.mobileNumber });
                    }
                })
                .catch(err => console.log("Error fetching user details", err));
        }
    }, []);

    return (
        <div className="container">
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ zIndex: 1100 }}>
                <button className="close-btn" onClick={() => setSidebarOpen(false)}>
                    &times;
                </button>
                <nav className="sidebar-nav">
                    <Link to="/sellerprofile">My Profile</Link>
                    <Link to="/messages">Contact with Customers</Link> {/* Updated for sellers */}
                    <Link to="/" className="logout-link" onClick={() => localStorage.clear()}>Log Out</Link>
                    <Link to="/">AI Book Recommendations</Link>
                </nav>
            </div>
            {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
            <div className="main-content">
                <header className="navbar" style={{ zIndex: sidebarOpen ? 1000 : 1050 }}>
                    <div className="UserInformation">
                        <div className="UserName">
                            {user.firstName ? `${user.firstName} ${user.lastName}` : "Guest"}
                        </div>
                        <div className="Details">
                            {user.email ? `Email: ${user.email}` : "Verify your account with mail"}<br />
                            {user.address ? `Address: ${user.address}` : ""}<br />
                            {user.mobileNumber ? `Contact No: ${user.mobileNumber}` : ""}
                        </div>
                    </div>

                    <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                        &#9776;
                    </button>
                </header>

                <main className="content-box">
                    <p>Resize the browser window to understand how it works.</p>
                </main>
            </div>
        </div>
    );
};

export default HomePage;
