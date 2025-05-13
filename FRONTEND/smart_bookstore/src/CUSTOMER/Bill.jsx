import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/Bill.css"; // External CSS

const Bill = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: localStorage.getItem("userEmail") || "",
        location: "",
        phone: "",
    });

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
                if (Array.isArray(data)) {
                    setPurchases(data); // Already an array
                } else if (data.purchases) {
                    setPurchases(data.purchases); // Handle legacy structure
                } else {
                    setPurchases([]); // Default empty
                }
                setError("");
            })
            .catch((err) => {
                console.error(err);
                setError("Error fetching purchases.");
            })
            .finally(() => setLoading(false));

    }, [email]);

    const totalAmount = purchases.reduce((acc, item) => acc + item.Price * item.quantity, 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePayment = (e) => {
        e.preventDefault();

        fetch(`http://localhost:5000/api/submit-bill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                totalAmount,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to submit bill");
                return res.json();
            })
            .then(() => {
                alert("Payment successful! Bill stored.");
            })
            .catch((err) => {
                setError("Error submitting bill. Try again later.");
                console.error(err);
            });
    };

    const handleDelete = (bookTitle) => {
        fetch(`http://localhost:5000/api/delete-purchase`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookTitle, email }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to delete purchase");
                return res.json();
            })
            .then(() => {
                setPurchases((prevPurchases) =>
                    prevPurchases.filter((item) => item.bookTitle !== bookTitle)
                );
            })
            .catch((err) => {
                setError("Error deleting purchase. Try again later.");
                console.error(err);
            });
    };

    return (
        <div className="bill-container-B">
            {loading ? (
                <p>Loading purchases...</p>
            ) : error ? (
                <p className="error-B">{error}</p>
            ) : purchases.length === 0 ? (
                <p>No purchases found.</p>
            ) : (
                <div className="bill-content-B">
                    {/* Left: Purchases List */}
                    <div className="left-section-B">
                        <div className="purchases-list-B">
                            {purchases.map((item, index) => (
                                <div key={index} className="purchase-item-B">
                                    <div className="purchase-details-B">
                                        <span className="bookTTL-B">{item.bookTitle}</span>
                                        <span className="PrZ-B">${item.Price.toFixed(2)}</span>
                                        <span className="QnTTy-B">X{item.quantity}</span>
                                        <button
                                            className="delete-btn-B"
                                            onClick={() => handleDelete(item.bookTitle)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="total-amount-B">
                            <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
                        </div>
                    </div>

                    {/* Right: Payment Form */}
                    <div className="right-section-B">
                        <form className="payment-form-B" onSubmit={handlePayment}>
                            <h3>Payment Information</h3>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label>Location:</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                            <label>Phone Number:</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                            <button type="submit" className="payment-btn-B">Payment</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Home Button */}
            <div className="bottom-buttons-B">
                <Link to="/frontpage" className="home-btn-B">Home</Link>
            </div>
        </div>
    );
};

export default Bill;
