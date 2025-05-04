import React, { useEffect, useState } from 'react';
import '../CSS/CustomerInformation.css';

const CustomerCard = () => {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/customerinformation')
            .then(res => res.json())
            .then(data => setCustomers(data))
            .catch(err => console.error('Error fetching customer data:', err));
    }, []);

    return (
        <div className="card-container">
            {customers.map(customer => (
                <div key={customer._id} className="customer-card">
                    <h2 className="customer-name">{customer.firstName} {customer.lastName}</h2>
                    <p className='info'><strong>Email:</strong> {customer.email}</p>
                    <p className='info'><strong>Phone:</strong> {customer.mobileNumber}</p>
                    <p className='info'><strong>Gender:</strong> {customer.gender}</p>
                    <p className='info'><strong>Address:</strong> {customer.address}</p>
                    <p className='info'><strong>Country:</strong> {customer.country}</p>
                    <p className="customer-id"><strong>ID:</strong> {customer.customerId}</p>
                </div>
            ))}
        </div>
    );
};

export default CustomerCard;
