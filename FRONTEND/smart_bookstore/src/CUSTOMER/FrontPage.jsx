import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/FrontPage.css";

const FrontPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        mobileNumber: "",
    });
    const [books, setBooks] = useState([]); // State to store books
    const [error, setError] = useState(""); // State to store error messages
    const navigate = useNavigate(); // ✅ Use navigate

    const handleLogout = async () => {
        const email = localStorage.getItem("userEmail");
    
        if (!email) return alert("User not logged in");
    
        try {
            // ✅ Delete all purchases related to the user
            const deleteResponse = await fetch("http://localhost:5000/api/delete-purchases", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
    
            const deleteData = await deleteResponse.json();
            if (!deleteResponse.ok) {
                return alert(`Error: ${deleteData.message}`);
            }
    
            // ✅ Perform logout only if delete was successful
            const response = await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
    
            if (response.ok) {
                localStorage.removeItem("userEmail"); // Clear local storage
                navigate("/"); // Redirect to login page
            }
        } catch (error) {
            console.error("Error during logout", error);
        }
    };
    
    
    

    // Fetch user details
    useEffect(() => {
        const customerId = localStorage.getItem("customerId");
    
        if (customerId) {
            fetch(`http://localhost:5000/api/customer/${customerId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data) {
                        setUser({
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                            address: data.address,
                            mobileNumber: data.mobileNumber,
                        });
    
                        // ✅ Store email in local storage
                        localStorage.setItem("userEmail", data.email);
                    }
                })
                .catch((err) => console.log("Error fetching user details", err));
        }
    }, []);
    

    // Fetch all book titles and medium images
    useEffect(() => {
        fetch("http://localhost:5000/api/books")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setBooks(data); // Set books only if data is an array
                } else {
                    console.error("Books data is not an array:", data);
                    setError("Failed to fetch books. Please try again later.");
                }
            })
            .catch((err) => {
                console.log("Error fetching books:", err);
                setError("Failed to fetch books. Please try again later.");
            });
    }, []);

    // ✅ Function to handle book click and navigate with state
    const handleBookClick = (book) => {
        navigate("/books", { state: { book } });
    };

    return (
        <div className="container">
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ zIndex: 1100 }}>
                <button className="close-btn" onClick={() => setSidebarOpen(false)}>
                    &times;
                </button>
                <nav className="sidebar-nav">
                    <Link to="/customerprofile">My Profile</Link>
                    <Link to="/messages">Contact with Sellers</Link>
                    <Link to="/purchase">Set Bills</Link>
                    <Link to="/information">Comparison</Link>
                    <a href="http://localhost:3001/recbook">AI Book Recommendations</a>
                    <Link to="/" onClick={handleLogout}>Log Out</Link>
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
                    <div className="books-container">
                        {error ? (
                            <p>{error}</p>
                        ) : books.length === 0 ? (
                            <p>Loading books...</p>
                        ) : (
                            <div className="books-list">
                                {books.map((book, index) => (
                                    <div
                                        key={index}
                                        className="book-card"
                                        onClick={() => handleBookClick(book)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="book-item">
                                            <img
                                                src={book.imageURLS?.medium}
                                                alt={book.title}
                                                className="book-image"
                                            />
                                            <p className="book-title">{book.title}</p>
                                            <p className="book-price">${book.Price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FrontPage;
