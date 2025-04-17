import { useState, useEffect } from "react";
import "../CSS/CustomerProfile.css";
import { Link } from "react-router-dom";

const CustomerProfile = () => {
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
        const customerId = localStorage.getItem("customerId");
        if (customerId) {
            fetch(`http://localhost:5000/api/customer/${customerId}`)
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

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const customerId = localStorage.getItem("customerId"); // Get the customerId
    
        if (!customerId) {
            alert("User not logged in");
            return;
        }
    
        if (file) {
            const formData = new FormData();
            formData.append("profileImage", file);
    
            // Include the customerId in the URL
            fetch(`http://localhost:5000/api/upload-profile-image/${customerId}`, {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setFormData((prevData) => ({ ...prevData, profileImage: data.data.profileImage }));
                        alert("Profile image uploaded successfully");
                    } else {
                        alert("Error uploading image");
                    }
                })
                .catch((error) => {
                    console.error("Error uploading image", error);
                    alert("Error uploading image");
                });
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const customerId = localStorage.getItem("customerId");

        if (!customerId) {
            alert("User not logged in");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/customer/${customerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setButtonState({ text: "Changed", color: "#1fd655" });
            } else {
                alert("Error: " + data.message);
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
                        src={formData.profileImage || "customerDefault.jpg"}

                    />
                </div>
                <input type="file" id="fileInput" onChange={handleImageUpload} hidden />

                {/* Button to trigger file input */}
                <button className="upload-new" onClick={() => document.getElementById("fileInput").click()}>
                    Upload New
                </button>
                <button
                    className="delete-avatar"
                    onClick={() => setFormData({ ...formData, profileImage: "" })}
                >
                    Delete Avatar
                </button>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        placeholder="Amir"
                        onChange={handleChange}

                    />
                </div>

                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        placeholder="Sakib"
                        onChange={handleChange}

                    />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        placeholder="example@gmail.com"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        placeholder="+880"
                        onChange={handleChange}
                        required
                    />
                </div>


                <div className="form-group">
                    <label>Country</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        placeholder="Bangladesh"
                        onChange={handleChange}
                    />
                </div>


                <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        placeholder="Merul Badda, Dhaka"
                        onChange={handleChange}
                        
                    />
                </div>
                <div className="form-group">
                    <label>Gender *</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="save-changes"
                    style={{ backgroundColor: buttonState.color }}
                >
                    {buttonState.text}
                </button>
                <Link to="/frontpage" className="profileUpdateBack">
                    Back
                </Link>

            </form>
        </div>
    );
};

export default CustomerProfile;
