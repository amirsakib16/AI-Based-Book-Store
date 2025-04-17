import { useState, useEffect } from "react";
import "../CSS/SellerProfile.css";
import { Link } from "react-router-dom";

const SellerProfile = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        gender: "",
        country: "",
        address: "",
        profileImage: ""
    });

    const [buttonState, setButtonState] = useState({ text: "Save Changes", color: "" });

    useEffect(() => {
        const sellerId = localStorage.getItem("sellerId");
        if (sellerId) {
            fetch(`http://localhost:5000/api/seller/${sellerId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data) setFormData(data);
                })
                .catch(() => alert("Error fetching profile"));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        const sellerId = localStorage.getItem("sellerId");

        if (!sellerId) {
            alert("User not logged in");
            return;
        }

        if (file) {
            const imageData = new FormData();
            imageData.append("profileImage", file);

            try {
                const response = await fetch(`http://localhost:5000/api/upload-profile-image/${sellerId}`, {
                    method: "POST",
                    body: imageData,
                });

                const data = await response.json();
                if (response.ok) {
                    setFormData((prevData) => ({ ...prevData, profileImage: data.data.profileImage }));
                    alert("Profile image uploaded successfully");
                } else {
                    alert("Error uploading image");
                }
            } catch (error) {
                alert("Error uploading image");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sellerId = localStorage.getItem("sellerId");

        if (!sellerId) {
            alert("User not logged in");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/seller/${sellerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setButtonState({ text: "Changes Saved", color: "#1fd655" });
            } else {
                alert("Error updating profile");
            }
        } catch (error) {
            alert("Error updating profile");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-section">
                <div className="profile-pic">
                    <img
                        src={formData.profileImage || "sellerDefault.jpg"}
                        alt="Profile"
                    />
                </div>
                <input type="file" id="fileInput" onChange={handleImageUpload} hidden />

                <button className="upload-new" onClick={() => document.getElementById("fileInput").click()}>
                    Upload New
                </button>
                <button className="delete-avatar" onClick={() => setFormData({ ...formData, profileImage: "" })}>
                    Delete Avatar
                </button>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Amir" />
                </div>

                <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Sakib" />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Bangladesh" />
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Merul Badda, Dhaka" />
                </div>

                <div className="form-group">
                    <label>Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <button type="submit" className="save-changes" style={{ backgroundColor: buttonState.color }}>
                    {buttonState.text}
                </button>

                <Link to="/homepage" className="profileUpdateBack">
                    Back
                </Link>
            </form>
        </div>
    );
};

export default SellerProfile;
