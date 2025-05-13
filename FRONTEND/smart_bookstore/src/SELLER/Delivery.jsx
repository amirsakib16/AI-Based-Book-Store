import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/Delivery.css';

const App = () => {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [email, setEmail] = useState('');
    const [service, setService] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (email) {
            axios.get(`http://localhost:5000/api/bills?email=${email}`)
                .then(response => {
                    setBills(response.data);
                })
                .catch(error => console.error('Error fetching bills:', error));
        }
    }, [email]);

    const handleSelectBill = (bill) => {
        setSelectedBill(bill);
        setService(bill.service);
        setTotalAmount(bill.totalAmount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Submitted Successfully');
        const billData = { email, service, quantity, totalAmount };

        axios.post('http://localhost:5000/api/bills', billData)
            .then(response => {
                alert('Delivery Confirmed! Your bill has been submitted.');
                setEmail('');
                setService('');
                setQuantity(1);
                setTotalAmount(0);
            })
            .catch(error => console.error('Error submitting bill:', error));
    };

    return (
        <div className="container-D">
            {email && (
                <div className="sidebar-D">
                    <h3>Bill Items</h3>
                    <ul>
                        {bills.map((bill, index) => (
                            <li key={index}>
                                <span>{bill.service} - ${bill.totalAmount}</span>
                                <button onClick={() => handleSelectBill(bill)}>Select</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="form-container-D">
                <h3>Create Bill</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>Service:</label>
                        <input
                            type="text"
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>Quantity:</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label>Total Amount:</label>
                        <input
                            type="number"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default App;
