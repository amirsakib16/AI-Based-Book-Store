import React from 'react'
import { Link } from "react-router-dom"
import '../App.css'

const LogIn = () => {
    return (
        <div className="login-container">
            <div className='storeName'>WELCOME</div>
            <p>Please select your role to continue:</p>

            <div className="button-group">
                <Link to="/customer">
                    <button className="customer-btn">Log In as Customer</button>
                </Link>
                <Link to="/seller">
                    <button className="seller-btn">Log In as Seller</button>
                </Link>
            </div>
        </div>
    )
}

export default LogIn
