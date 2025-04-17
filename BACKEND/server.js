const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const csv = require("csv-parser");
const http = require("http");
const { Server } = require("socket.io");



const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Adjust to your frontend URL
        methods: ["GET", "POST"],
    },
});

// ✅ Set up Multer Storage Engine (where to store the uploaded files)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profileImages'); // Save to this folder
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname)); // Use a unique file name
    },
});

// ✅ File filter to accept only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only images are allowed"), false);
    }
};

// ✅ Multer setup for file upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
}).single("profileImage");

// ✅ Connect to MongoDB
mongoose
    .connect("mongodb://127.0.0.1:27017/BookStore", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));












// ✅ Define Schema & Model for User Profile
const customerSchema = new mongoose.Schema(
    {
        customerId: { type: String, unique: true },
        firstName: String,
        lastName: String,
        email: { type: String, unique: true },
        mobileNumber: String,
        gender: String,
        country: String,
        address: String,
        profileImage: String, // URL or path to the profile image
        activity: { type: Boolean, default: false }
    },
    { collection: "UserProfile" }
);

const UserProfile = mongoose.model("UserProfile", customerSchema);


// ✅ **User Login API (Generates Unique Key & Updates Activity)**
app.post("/api/login", async (req, res) => {
    try {
        const { email } = req.body;
        let customer = await UserProfile.findOne({ email });

        if (!customer) {
            customer = new UserProfile({ email, customerId: uuidv4(), activity: true });
            await customer.save();
        } else {
            // Update activity to true
            customer.activity = true;
            await customer.save();
        }

        res.json({ message: "Login successful", customerId: customer.customerId, activity: customer.activity });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
});
app.post("/api/logout", async (req, res) => {
    try {
        const { customerId } = req.body;

        const customer = await UserProfile.findOneAndUpdate(
            { customerId },
            { activity: false },
            { new: true }
        );

        if (!customer) return res.status(404).json({ message: "Customer not found" });

        res.json({ message: "Logout successful", activity: customer.activity });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error });
    }
});
app.put("/api/customer/:customerId", async (req, res) => {
    try {
        const updatedCustomer = await UserProfile.findOneAndUpdate(
            { customerId: req.params.customerId },
            req.body,
            { new: true }
        );

        if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });
        res.json({ message: "Profile updated successfully", data: updatedCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
});
app.get("/api/customer/:customerId", async (req, res) => {
    try {
        const customer = await UserProfile.findOne({ customerId: req.params.customerId });
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving profile", error });
    }
});

// ✅ **Upload Profile Image API**
app.post("/api/upload-profile-image/:customerId", upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Get the file path or URL
        const imageUrl = `/uploads/profileImages/${req.file.filename}`;

        // Update the user's profile image in the database
        const updatedCustomer = await UserProfile.findOneAndUpdate(
            { customerId: req.params.customerId },
            { profileImage: imageUrl },
            { new: true }
        );

        if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });

        // Send back the updated data with the profile image URL
        res.json({ message: "Profile image updated successfully", data: updatedCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error uploading profile image", error });
    }
});


app.get('/api/messages', async (req, res) => {
    try {
        // Assuming you already have some data in your database.
        const activeUsers = await UserProfile.find({ activity: true });

        if (activeUsers.length === 0) {
            return res.status(404).json({ message: "No active users found" });
        }

        res.json(activeUsers);
    } catch (error) {
        console.error('Error fetching active users:', error);
        res.status(500).send('Error fetching active users');
    }
});



















// ✅ Define Schema & Model for Seller Profile
const sellerSchema = new mongoose.Schema(
    {
        sellerId: { type: String, unique: true },
        firstName: String,
        lastName: String,
        email: { type: String, unique: true },
        mobileNumber: String,
        gender: String,
        country: String,
        address: String,
        profileImage: String,  // URL or path to the profile image
    },
    { collection: "SellerProfile" }
);

const SellerProfile = mongoose.model("SellerProfile", sellerSchema);

// ✅ **Admin Login API (Generates Unique Key)**
app.post("/api/admin", async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Email received:", email);
        let seller = await SellerProfile.findOne({ email });
        console.log("Existing seller:", seller);
        if (!seller) {
            seller = new SellerProfile({ email, sellerId: uuidv4() });
            await seller.save();
            console.log("New seller created:", seller);
        }
        res.json({ message: "Login successful", sellerId: seller.sellerId });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message, });
    }
});

// ✅ **Update Seller Profile**
app.put("/api/seller/:sellerId", async (req, res) => {
    try {
        const updatedSeller = await SellerProfile.findOneAndUpdate(
            { sellerId: req.params.sellerId },
            req.body,
            { new: true }
        );

        if (!updatedSeller) return res.status(404).json({ message: "Seller not found" });
        res.json({ message: "Profile updated successfully", data: updatedSeller });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
});

// ✅ **Get Seller Profile by `sellerId`**
app.get("/api/seller/:sellerId", async (req, res) => {
    try {
        const seller = await SellerProfile.findOne({ sellerId: req.params.sellerId });
        if (!seller) return res.status(404).json({ message: "Seller not found" });
        res.json(seller);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving profile", error });
    }
});



















const bookSchema = new mongoose.Schema(
    {
        ISBN: Number,
        "Book-Title": String,
        "Book-Author": String,
        "Year-Of-Publication": Number,
        Publisher: String,
        "Image-URL-S": String,
        "Image-URL-M": String,
        "Image-URL-L": String,
        Price: Number
    },
    { collection: "Book" }
);
const Book = mongoose.model("Book", bookSchema);
app.get("/api/books", async (req, res) => {
    try {
        const books = await Book.find({}, { "Book-Title": 1, "Image-URL-L": 1, Price: 1, "Book-Author": 1, _id: 0 });
        if (!books || books.length === 0) {
            return res.status(404).json({ error: "No books found" });
        }
        const formattedBooks = books.map(book => ({
            title: book["Book-Title"],
            imageURLS: {
                medium: book["Image-URL-L"],
            },
            Price: book.Price,
            author: book["Book-Author"] 
        }));
        res.status(200).json(formattedBooks);
    } catch (err) {
        console.error("❌ Error fetching books:", err);
        res.status(500).json({ error: "Failed to fetch books" });
    }
});
app.get("/api/books/:isbn", async (req, res) => {
    let { isbn } = req.params;
    try {
        const book = await Book.findOne({ ISBN: isbn }) || await Book.findOne({ ISBN: Number(isbn) });

        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).json({ error: "Server error" });
    }
});










const chatSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
}, { collection: "Chat" });

const Chat = mongoose.model("Chat", chatSchema);

// Store user socket connections
const userSockets = {};

// ✅ WebSocket Connection
io.on("connection", (socket) => {
    console.log("⚡ New user connected:", socket.id);

    socket.on("registerUser", (userId) => {
        userSockets[userId] = socket.id;
        console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    });

    // Listen for new messages
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        try {
            const newMessage = new Chat({ senderId, receiverId, message });
            await newMessage.save(); // ✅ Ensure the message is saved in MongoDB
            console.log("✅ Message saved:", newMessage);

            // Emit only to the receiver (if online) and sender for instant update
            if (userSockets[receiverId]) {
                io.to(userSockets[receiverId]).emit("receiveMessage", newMessage);
            }
            io.to(socket.id).emit("receiveMessage", newMessage);
        } catch (error) {
            console.error("❌ Error saving message:", error);
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
    });
});

// ✅ Fetch Active Users
app.get('/api/messages', async (req, res) => {
    try {
        const activeUsers = await UserProfile.find({ activity: true });
        res.json({ users: activeUsers });
    } catch (error) {
        console.error("❌ Error fetching active users:", error);
        res.status(500).json({ message: "Error fetching active users", error });
    }
});

// ✅ Fetch Chat Messages for a Specific User
app.get("/api/messages/:senderId/:receiverId", async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const messages = await Chat.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ message: "Error fetching messages", error });
    }
});





















const purchaseSchema = new mongoose.Schema({
    email: String,
    bookTitle: String,
    format: String,
    quantity: Number,
    Price: Number
}, { collection: "Purchase" });

const Purchase = mongoose.model("Purchase", purchaseSchema);

// Route to add book to cart
app.post("/api/add-to-cart", async (req, res) => {
    try {
        const { email, bookTitle, format, quantity, Price } = req.body;

        if (!email || !bookTitle || !format || !quantity || !Price) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newPurchase = new Purchase({ email, bookTitle, format, quantity, Price });
        await newPurchase.save();

        res.status(201).json({ message: "Book added to cart successfully!" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/api/delete-purchases", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const result = await Purchase.deleteMany({ email });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No purchases found for this user" });
        }

        res.json({ message: "All purchases deleted successfully", data: result });
    } catch (error) {
        console.error("Error deleting purchases:", error);
        res.status(500).json({ message: "Error deleting purchases", error });
    }
});

app.get("/api/purchases", async (req, res) => {
    try {
        const { email } = req.query;
        const purchases = await Purchase.find({ email: email });
        res.json(purchases);
    } catch (error) {
        console.error("Error fetching purchases:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete('/api/delete-purchase', async (req, res) => {
    const { bookTitle, email } = req.body;

    if (!bookTitle || !email) {
        return res.status(400).json({ message: "Missing book title or email" });
    }

    try {
        // Find and delete the purchase from the database
        const result = await Purchase.findOneAndDelete({ email, bookTitle });

        if (!result) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        res.status(200).json({ message: "Purchase deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting purchase" });
    }
});




























const informationSchema = new mongoose.Schema({
    "Book-Title": String,
    "Book-Author": String,
    "Year-Of-Publication": Number,
    Publisher: String,
    "Image-URL-S": String,
    "Image-URL-M": String,
    "Image-URL-L": String,
    Price: Number,
    Pages: Number,
    Rating: Number,
    Recommendation: Number
}, { collection: "Information" });

// Create Model
const Information = mongoose.model("Information", informationSchema);

// Route to fetch all books (Book Title and Large Image URL)
app.get("/api/information", async (req, res) => {
    try {
        const books = await Information.find({}, { "Book-Title": 1, "Image-URL-L": 1 }); // Fetch book title and large image URL
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error });
    }
});

// Route to compare books
app.post("/api/information", async (req, res) => {
    const { book1, book2 } = req.body;

    try {
        const bookDetails1 = await Information.findOne({ "Book-Title": book1 });
        const bookDetails2 = await Information.findOne({ "Book-Title": book2 });

        if (!bookDetails1 || !bookDetails2) {
            return res.status(404).json({ message: "One or both books not found" });
        }

        res.json({ book1: bookDetails1, book2: bookDetails2 });
    } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});







// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
