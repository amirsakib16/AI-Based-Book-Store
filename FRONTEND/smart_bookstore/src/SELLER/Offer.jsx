import React, { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/Offer.css";

const OffersManager = () => {
    const [offers, setOffers] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        discountPercentage: "",
        validFrom: "",
        validTo: "",
        books: []
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchOffers();
        fetchBooks();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/offers");
            setOffers(res.data);
        } catch (err) {
            console.error("Failed to fetch offers", err);
        }
    };

    const fetchBooks = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/books");
            setAllBooks(res.data);
        } catch (err) {
            console.error("Failed to fetch books", err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleBookSelect = (e) => {
        const selectedBooks = Array.from(e.target.selectedOptions, opt => opt.value);
        const selectedTitles = Array.from(e.target.selectedOptions, opt => opt.text);

        setForm(prev => ({
            ...prev,
            books: selectedBooks,
            title: selectedBooks.length === 1 ? selectedTitles[0] : prev.title
        }));
    };

    const handleAddOffer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await axios.post("http://localhost:5000/api/offer", {
                title: form.title,
                description: form.description,
                discountPercentage: parseFloat(form.discountPercentage),
                validFrom: new Date(form.validFrom),
                validTo: new Date(form.validTo),
                isActive: true,
                books: form.books
            });

            setMessage(res.data.message);
            setForm({
                title: "",
                description: "",
                discountPercentage: "",
                validFrom: "",
                validTo: "",
                books: []
            });
            fetchOffers();
        } catch (err) {
            console.error("Failed to add offer", err);
            setMessage("Failed to add offer.");
        }

        setLoading(false);
    };

    const deleteOffer = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/offer/${id}`);
            fetchOffers();
        } catch (err) {
            console.error("Failed to delete offer", err);
        }
    };

    return (
        <div className="offersManager-container">
            <h2 className="offersManager-title">📢 Manage Offers</h2>

            <form className="offersManager-form" onSubmit={handleAddOffer}>
                <input
                    type="text"
                    name="title"
                    className="offersManager-input-title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="description"
                    className="offersManager-input-description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="discountPercentage"
                    className="offersManager-input-discount"
                    placeholder="Discount (%)"
                    value={form.discountPercentage}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="validFrom"
                    className="offersManager-input-validFrom"
                    value={form.validFrom}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="validTo"
                    className="offersManager-input-validTo"
                    value={form.validTo}
                    onChange={handleChange}
                    required
                />

                <select
                    multiple
                    className="offersManager-select-books"
                    value={form.books}
                    onChange={handleBookSelect}
                >
                    {allBooks.map(book => (
                        <option
                            key={book._id}
                            value={book._id}
                            className="offersManager-book-option"
                        >
                            {book.title}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="offersManager-submit-button"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Offer"}
                </button>
            </form>

            {message && <p className="offersManager-message">{message}</p>}

            <h3 className="offersManager-subtitle">Current Offers</h3>
            <ul className="offersManager-list">
                {offers.map((offer) => (
                    <li key={offer._id} className="offersManager-card">
                        <strong className="offersManager-card-title">{offer.title}</strong> - {offer.discountPercentage}% off
                        <br />
                        <span className="offersManager-card-validity">
                            Valid: {new Date(offer.validFrom).toLocaleDateString()} to {new Date(offer.validTo).toLocaleDateString()}
                        </span>
                        <br />
                        <span className="offersManager-card-books">
                            Books: {offer.books?.length ? offer.books.map(book => book.title).join(", ") : "No books attached"}
                        </span>
                        <br />
                        <button
                            className="offersManager-delete-button"
                            onClick={() => deleteOffer(offer._id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OffersManager;
