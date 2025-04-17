import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/Bill.css"; // Import the external CSS file

const Bill = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const email = localStorage.getItem("userEmail") || "";

    useEffect(() => {
        if (!email) {
            setLoading(false);
            setError("No email found. Please log in.");
            return;
        }

        fetch(`http://localhost:5000/api/purchases?email=${email}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch purchases");
                return res.json();
            })
            .then((data) => {
                setPurchases(data);
                setError("");
            })
            .catch((err) => {
                setError("Error fetching purchases. Try again later.");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [email]);

    // Calculate total amount
    const totalAmount = purchases.reduce((acc, item) => acc + item.Price * item.quantity, 0);

    // Handle Delete button click
    const handleDelete = (bookTitle) => {
        fetch(`http://localhost:5000/api/delete-purchase`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bookTitle, email }), // Sending bookTitle and email as JSON
        })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to delete purchase");
            return res.json();
        })
        .then(() => {
            setPurchases((prevPurchases) =>
                prevPurchases.filter((item) => item.bookTitle !== bookTitle) // Remove deleted item from the state
            );
        })
        .catch((err) => {
            setError("Error deleting purchase. Try again later.");
            console.error(err);
        });
    };

    return (
        <div className="bill-container">
            {loading ? (
                <p>Loading purchases...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : purchases.length === 0 ? (
                <p>No purchases found.</p>
            ) : (
                <>
                    {/* List of Purchases */}
                    <div className="purchases-list">
                        {purchases.map((item, index) => (
                            <div key={index} className="purchase-item">
                                <div className="purchase-details">
                                    <span className="bookTTL">{item.bookTitle}</span>
                                    <span className="PrZ">${item.Price.toFixed(2)}</span>
                                    <span className="QnTTy">X{item.quantity}</span>
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => handleDelete(item.bookTitle)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Amount */}
                    <div className="total-amount">
                        <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
                    </div>
                </>
            )}

            {/* Back and Home Buttons */}
            <div className="bottom-buttons">
                <Link to="#" className="back-btn">Payment</Link>
                <Link to="/frontpage" className="home-btn">Home</Link>
            </div>
        </div>
    );
};

export default Bill;
