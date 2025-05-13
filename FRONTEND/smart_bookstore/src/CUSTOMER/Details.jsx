import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../CSS/Details.css";

const QuantitySelector = ({ quantity, increaseQty, decreaseQty }) => (
    <div className="quantity-selector">
        <button className="quantity-btn" onClick={decreaseQty}>-</button>
        <span className="quantity">{quantity}</span>
        <button className="quantity-btn" onClick={increaseQty}>+</button>
    </div>
);

const BookDetails = () => {
    const location = useLocation();
    const book = location.state?.book;

    const [quantity, setQuantity] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState("Hardcover");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const increaseQty = () => setQuantity(prevQty => prevQty + 1);
    const decreaseQty = () => {
        if (quantity > 1) setQuantity(prevQty => prevQty - 1);
    };

    const userEmail = localStorage.getItem("userEmail") || "";

    const addToCart = async () => {
        if (!userEmail) {
            setAlertMessage("Please log in to add items to the cart.");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/add-to-cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    bookTitle: book.title,
                    format: selectedFormat,
                    quantity: quantity,
                    Price: book.Price
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAlertMessage("Added to Cart!");
            } else {
                setAlertMessage(data.error || "⚠️ Error adding to cart.");
            }
        } catch (error) {
            console.error("Error:", error);
            setAlertMessage("❌ Failed to connect to server.");
        }

        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    if (!book) return <p>No book details available.</p>;

    return (
        <div className="book-details-container">
            <div className="book-images">
                <img src={book.imageURLS?.medium} alt={book.title} className="main-book-image" />
            </div>

            <div className="book-info">
                <h2 className="BKttL">{book.title}</h2>
                <p className="book-author">by {book.author || "Unknown Author"}</p>
                <p className="BKprZ">${book.Price}</p>

                <div className="book-formats">
                    <span className="format-label">Format:</span>
                    <div className="format-options">
                        {["Hardcover", "Paperback", "E-book"].map((format) => (
                            <button
                                key={format}
                                className={`format-option ${selectedFormat === format ? "selected" : ""}`}
                                onClick={() => setSelectedFormat(format)}
                            >
                                {format}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedFormat !== "E-book" && (
                    <>
                        <span className="format-label">Quantity</span>
                        <QuantitySelector
                            quantity={quantity}
                            increaseQty={increaseQty}
                            decreaseQty={decreaseQty}
                        />
                    </>
                )}

                <div className="buttons">
                    <button className="buy-now">Buy Now</button>
                    <div>
                        {showAlert && (
                            <div className="custom-alert">
                                <p>{alertMessage}</p>
                            </div>
                        )}
                        <button className="add-to-cart" onClick={addToCart}>Add to Cart</button>

                        <Link
                            to="/reviews"
                            state={{ bookTitle: book.title }}
                            className="review-button"
                        >
                            Reviews
                        </Link>


                    </div>
                </div>



                <div className="button-container">
                    <Link to="/purchase" className="backTOfront">Set Bill</Link>
                    <Link to="/frontpage" className="MakeBill">Back</Link>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;