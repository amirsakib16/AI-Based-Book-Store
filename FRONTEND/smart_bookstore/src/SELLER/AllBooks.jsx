import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../CSS/AllBooks.css';

const SellerBooks = () => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    const fetchBooks = () => {
        axios.get("http://localhost:5000/api/books")
            .then(res => setBooks(res.data))
            .catch(err => console.error("❌ Error fetching books:", err));
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const deleteBook = (isbn) => {
        axios.delete(`http://localhost:5000/api/books/${isbn}`)
            .then(() => {
                alert("Book deleted");
                fetchBooks();
            })
            .catch(err => console.error("❌ Error deleting book:", err));
    };

    return (
        <>
            <div className="seller-books-container">
                {books.map((book, index) => (
                    <div key={index} className="seller-book-card">
                        <img src={book.imageURLS?.medium} alt={book.title} />
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <p className="book-price">${book.Price}</p>
                    </div>
                ))}
            </div>

            {/* Back button fixed to bottom-right */}
            <button className="back-button-fixed" onClick={() => navigate("/homepage")}>
                ← Back to Homepage
            </button>
        </>
    );
};

export default SellerBooks;
