import React, { useState, useEffect } from "react";
import "../CSS/Compare.css";
import { Link, useLocation, useSearchParams } from "react-router-dom";
const Compare = () => {
    const [books, setBooks] = useState([]);
    const [book1, setBook1] = useState("");
    const [book2, setBook2] = useState("");
    const [comparison, setComparison] = useState({});

    useEffect(() => {
        fetch("http://localhost:5000/api/information")
            .then(response => response.json())
            .then(data => setBooks(data))
            .catch(error => console.error("Error fetching books:", error));
    }, []);

    const copyToClipboard = (title) => {
        navigator.clipboard.writeText(title);
    };

    const pasteFromClipboard = (setBook) => {
        navigator.clipboard.readText().then(text => setBook(text));
    };

    const handleCompare = () => {
        fetch("http://localhost:5000/api/information", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ book1, book2 })
        })
            .then(response => response.json())
            .then(data => setComparison(data))
            .catch(error => console.error("Error fetching book details:", error));
    };

    return (
        <div className="CONT">
            {/* Book List Navbar */}
            <div className="booklistNAVbar">
                <ul>
                    {books.map((book, index) => (
                        <li key={index}>
                            <span>{book["Book-Title"]}</span>
                            <button onClick={() => copyToClipboard(book["Book-Title"])}>Copy</button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="MAINcontainer">
                {/* Top Navbar */}
                <div className="navigationBAR">
                    <button onClick={() => pasteFromClipboard(setBook1)}>Paste</button>
                    <input type="text" value={book1} onChange={(e) => setBook1(e.target.value)} placeholder="Enter first book name" />
                    <input type="text" value={book2} onChange={(e) => setBook2(e.target.value)} placeholder="Enter second book name" />
                    <button onClick={() => pasteFromClipboard(setBook2)}>Paste</button>
                </div>

                <div className="button-container">
                    <button className="compare-btn" onClick={handleCompare}>Compare</button>
                    <Link to="/frontpage" className="compare-btn">Back</Link>
                </div>

                {/* Comparison Results */}
                <div className="comparison-results">
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Attribute</th>
                                <th>{comparison.book1?.["Book-Title"] || "Book 1"}</th>
                                <th>{comparison.book2?.["Book-Title"] || "Book 2"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Author:</strong></td>
                                <td>{comparison.book1?.["Book-Author"] || "N/A"}</td>
                                <td>{comparison.book2?.["Book-Author"] || "N/A"}</td>
                            </tr>
                            <tr>
                                <td><strong>Year:</strong></td>
                                <td>{comparison.book1?.["Year-Of-Publication"] || "N/A"}</td>
                                <td>{comparison.book2?.["Year-Of-Publication"] || "N/A"}</td>
                            </tr>
                            <tr>
                                <td><strong>Publisher:</strong></td>
                                <td>{comparison.book1?.["Publisher"] || "N/A"}</td>
                                <td>{comparison.book2?.["Publisher"] || "N/A"}</td>
                            </tr>
                            <tr>
                                <td><strong>Price:</strong></td>
                                <td style={{ color: comparison.book1?.Price > comparison.book2?.Price ? "red" : "green" }}>
                                    ${comparison.book1?.Price || "N/A"}
                                </td>
                                <td style={{ color: comparison.book2?.Price > comparison.book1?.Price ? "red" : "green" }}>
                                    ${comparison.book2?.Price || "N/A"}
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Pages:</strong></td>
                                <td>{comparison.book1?.Pages || "N/A"}</td>
                                <td>{comparison.book2?.Pages || "N/A"}</td>
                            </tr>
                            <tr>
                                <td><strong>Rating:</strong></td>
                                <td style={{ color: comparison.book1?.Rating > comparison.book2?.Rating ? "green" : "red" }}>
                                    {comparison.book1?.Rating || "N/A"}
                                </td>
                                <td style={{ color: comparison.book2?.Rating > comparison.book1?.Rating ? "green" : "red" }}>
                                    {comparison.book2?.Rating || "N/A"}
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Recommendation:</strong></td>
                                <td style={{ color: comparison.book1?.Recommendation > comparison.book2?.Recommendation ? "green" : "red" }}>
                                    {comparison.book1?.Recommendation || "N/A"} Persons
                                </td>
                                <td style={{ color: comparison.book2?.Recommendation > comparison.book1?.Recommendation ? "green" : "red" }}>
                                    {comparison.book2?.Recommendation || "N/A"} Persons
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Compare;