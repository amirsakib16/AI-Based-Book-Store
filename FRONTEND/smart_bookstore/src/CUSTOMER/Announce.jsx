import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/Announce.css';

const Demo = () => {
    const [offers, setOffers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/offers');
                setOffers(res.data);
                setError('');
            } catch (err) {
                console.error("❌ Error fetching offers:", err);
                setError("⚠️ Failed to load offers. Please try again later.");
            }
        };

        fetchOffers();
    }, []);

    return (
        <div className="container-Ann">
            <h1 className="title-Ann">🎁 Available Offers</h1>

            {error && <p className="error-Ann">{error}</p>}

            {!error && offers.length === 0 && (
                <p className="no-offers-Ann">No offers available at the moment.</p>
            )}

            {!error && offers.length > 0 && (
                <ul className="offer-list-Ann">
                    {offers.map((offer) => (
                        <li key={offer._id} className="offer-card-Ann">
                            <h2>{offer.title}</h2>
                            <p>{offer.description}</p>
                            <p><strong>Discount:</strong> {offer.discountPercentage}%</p>
                            <p>
                                <strong>Valid:</strong>{" "}
                                {new Date(offer.validFrom).toLocaleDateString()} -{" "}
                                {new Date(offer.validTo).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Demo;
