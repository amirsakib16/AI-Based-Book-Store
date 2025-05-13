import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/FrontPage.css";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Backend address
const FrontPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showAnnouncements, setShowAnnouncements] = useState(false);
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        mobileNumber: "",
    });
    const [searchBy, setSearchBy] = useState("title");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [books, setBooks] = useState([]);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!query.trim()) {
            setError("Please enter a search term.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/search?by=${searchBy}&value=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                setResults(data);
                setError("");
            } else {
                setResults([]);
                setError(data.message || "No results found.");
            }
        } catch (err) {
            console.error("Search error:", err);
            setError("Server error. Please try again later.");
        }
    };

    const handleLogout = async () => {
        const email = localStorage.getItem("userEmail");
        if (!email) return alert("User not logged in");

        try {
            const deleteResponse = await fetch("http://localhost:5000/api/delete-purchases", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const deleteData = await deleteResponse.json();
            if (!deleteResponse.ok) return alert(`Error: ${deleteData.message}`);

            const response = await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                localStorage.removeItem("userEmail");
                navigate("/");
            }
        } catch (error) {
            console.error("Error during logout", error);
        }
    };

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
                        localStorage.setItem("userEmail", data.email);
                    }
                })
                .catch((err) => console.error("Error fetching user details", err));
        }
    }, []);
    useEffect(() => {
        fetch("http://localhost:5000/api/books")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setBooks(data);
                } else {
                    console.error("Books data is not an array:", data);
                    setError("Failed to fetch books. Please try again later.");
                }
            })
            .catch((err) => {
                console.error("Error fetching books:", err);
                setError("Failed to fetch books. Please try again later.");
            });
    }, []);

    const handleBookClick = (book) => {
        navigate("/books", { state: { book } });
    };
    const handleNotificationClick = () => {
        setShowAnnouncements(!showAnnouncements);
        setUnreadCount(0); // Mark all as read
    };

    return (
        <div className="container">
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ zIndex: 1100 }}>
                <button className="close-btn" onClick={() => setSidebarOpen(false)}>
                    &times;
                </button>

                <nav className="sidebar-nav">
                    <Link to="/customerprofile">My Profile</Link>
                    <Link to="/purchase">Set Bills</Link>
                    <Link to="/announce">Offer</Link>
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

                        <div className="search-container">
                            <div className="search-controls">
                                <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                                    <option value="title">Search by Title</option>
                                    <option value="author">Search by Author</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder={`Enter ${searchBy}`}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button onClick={handleSearch}>Search</button>
                            </div>

                            {error && <p className="error">{error}</p>}

                            <div className="results">
                                {results.map((book, index) => (
                                    <div key={index} className="book-result">
                                        <img src={book.imageURLS.medium} alt={book.title} />
                                        <div>
                                            <h4>{book.title}</h4>
                                            <p>Author: {book.author}</p>
                                            <p>Price: ${book.Price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="Details">
                            {user.email ? `Email: ${user.email}` : "Verify your account with mail"}<br />
                            {user.address && `Address: ${user.address}`}<br />
                            {user.mobileNumber && `Contact No: ${user.mobileNumber}`}
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
