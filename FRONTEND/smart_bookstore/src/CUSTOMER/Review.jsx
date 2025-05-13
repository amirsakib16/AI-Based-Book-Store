import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import '../CSS/Review.css'; 
const ReviewPage = () => {
    const location = useLocation();
    const bookTitle = location.state?.bookTitle;
    const userEmail = localStorage.getItem("userEmail") || "";
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/reviews?title=${encodeURIComponent(bookTitle)}`);
                const data = await response.json();
                setReviews(data.reviews || []);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        if (bookTitle) fetchReviews();
    }, [bookTitle]);

    const handleSubmit = async () => {
        if (!userEmail) {
            setMessage("Please log in to submit a review.");
            return;
        }
        try {
            const response = await fetch("http://localhost:5000/api/add-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, title: bookTitle, review: newReview })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(" Review submitted.");
                setNewReview("");
                setReviews(prev => [...prev, { email: userEmail, review: newReview }]);
            } else {
                setMessage(data.error || " Could not submit review.");
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Server error.");
        }
    };

    return (
        <div className="review-page">
            <h2>Reviews for "{bookTitle}"</h2>

            {reviews.length > 0 ? (
                <ul className="review-list">
                    {reviews.map((r, index) => (
                        <li key={index}>
                            <strong>{r.email}</strong>: {r.review}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reviews yet.</p>
            )}

            <div className="review-form">
                <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Write your review..."
                />
                <button onClick={handleSubmit}>Submit Review</button>
                {message && <p className="review-msg">{message}</p>}
            </div>
        </div>
    );
};

export default ReviewPage;