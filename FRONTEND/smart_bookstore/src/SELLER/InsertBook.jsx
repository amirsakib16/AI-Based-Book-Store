import React, { useState , Link} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CSS/InsertBook.css';

const AddBook = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ISBN: '',
        title: '',
        author: '',
        year: '',
        publisher: '',
        imgS: '',
        imgM: '',
        imgL: '',
        price: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const bookData = {
                ISBN: Number(formData.ISBN),
                "Book-Title": formData.title,
                "Book-Author": formData.author,
                "Year-Of-Publication": Number(formData.year),
                "Publisher": formData.publisher,
                "Image-URL-S": formData.imgS,
                "Image-URL-M": formData.imgM,
                "Image-URL-L": formData.imgL,
                "Price": parseFloat(formData.price)
            };
            await axios.post('http://localhost:5000/api/books', bookData);
            alert('Book added successfully!');
            setFormData({
                ISBN: '',
                title: '',
                author: '',
                year: '',
                publisher: '',
                imgS: '',
                imgM: '',
                imgL: '',
                price: ''
            });
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Failed to add book.');
        }
    };

    return (
        <div className="add-book-container">
            <h2 className="add-book-title">New Book</h2>
            <form onSubmit={handleSubmit} className="add-book-form">
                <input type="text" name="ISBN" value={formData.ISBN} onChange={handleChange} placeholder="ISBN" required />
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Book Title" required />
                <input type="text" name="author" value={formData.author} onChange={handleChange} placeholder="Author" required />
                <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="Year of Publication" required />
                <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Publisher" required />
                <input type="text" name="imgS" value={formData.imgS} onChange={handleChange} placeholder="Image URL (Small)" required />
                <input type="text" name="imgM" value={formData.imgM} onChange={handleChange} placeholder="Image URL (Medium)" required />
                <input type="text" name="imgL" value={formData.imgL} onChange={handleChange} placeholder="Image URL (Large)" required />
                <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" required />
                <button type="submit">Add Book</button>
            </form>
            <button className="back-button" onClick={() => navigate("/homepage")}>
                ← Back to Homepage
            </button>
        </div>
    );
};

export default AddBook;
