const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const csv = require("csv-parser");
const http = require("http");
const { Server } = require("socket.io");
const port = 5000;


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

app.get('/api/customerinformation', async (req, res) => {
    const customers = await UserProfile.find();
    res.json(customers);
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




















// Book Schema
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

// GET: Fetch all books (minimal info)
app.get("/api/books", async (req, res) => {
    try {
        const books = await Book.find({}, {
            "Book-Title": 1,
            "Image-URL-L": 1,
            Price: 1,
            "Book-Author": 1,
            _id: 0
        });

        if (!books || books.length === 0) {
            return res.status(404).json({ error: "No books found" });
        }

        const formattedBooks = books.map(book => ({
            title: book["Book-Title"],
            imageURLS: {
                medium: book["Image-URL-L"]
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

// GET: Fetch one book by ISBN
app.get("/api/books/:isbn", async (req, res) => {
    const { isbn } = req.params;
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

// POST: Add a new book
app.post("/api/books", async (req, res) => {
    try {
        const {
            ISBN,
            "Book-Title": bookTitle,
            "Book-Author": bookAuthor,
            "Year-Of-Publication": year,
            Publisher,
            "Image-URL-S": imgS,
            "Image-URL-M": imgM,
            "Image-URL-L": imgL,
            Price
        } = req.body;

        if (!ISBN || !bookTitle || !bookAuthor || !year || !Publisher || !imgS || !imgM || !imgL || !Price) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newBook = new Book({
            ISBN,
            "Book-Title": bookTitle,
            "Book-Author": bookAuthor,
            "Year-Of-Publication": year,
            Publisher,
            "Image-URL-S": imgS,
            "Image-URL-M": imgM,
            "Image-URL-L": imgL,
            Price
        });

        await newBook.save();
        res.status(201).json({ message: "Book added successfully!", ISBN: newBook.ISBN });
    } catch (error) {
        console.error("❌ Error inserting book:", error);
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
// DELETE: Delete a book by ISBN
app.delete("/api/books/:isbn", async (req, res) => {
    try {
        const result = await Book.deleteOne({ ISBN: req.params.isbn });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Book not found" });
        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting book:", error);
        res.status(500).json({ error: "Server error" });
    }
});







const announcementSchema = new mongoose.Schema({
    title: String,
    message: String,
}, { collection: "ANNOUNCEMENT" });

const Announcement = mongoose.model("Announcement", announcementSchema);

// Get all announcements
app.get("/api/announcements", async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch announcements." });
    }
});

// Add new announcement
app.post("/api/add-announcement", async (req, res) => {
    const { title, message } = req.body;

    try {
        const newAnn = new Announcement({ title, message });
        await newAnn.save();

        // Emit to all connected clients
        io.emit("announcement-added", newAnn);

        res.json({ message: "Announcement added successfully", announcement: newAnn });
    } catch (err) {
        res.status(500).json({ message: "Failed to add announcement." });
    }
});
io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});












const purchaseSchema = new mongoose.Schema({
    email: { type: String, required: true },
    purchases: [
        {
            bookTitle: { type: String, required: true },
            format: { type: String, required: true },
            quantity: { type: Number, required: true },
            Price: { type: Number, required: true }
        }
    ]
}, { collection: "Cart" });

const Purchase = mongoose.model("Purchase", purchaseSchema);


// Route to add book to cart
app.post("/api/add-to-cart", async (req, res) => {
    try {
        const { email, bookTitle, format, quantity, Price } = req.body;

        if (!email || !bookTitle || !format || !quantity || !Price) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Find user cart
        let userCart = await Purchase.findOne({ email });

        if (userCart) {
            // Check if the item already exists in the cart
            const existingItemIndex = userCart.purchases.findIndex(
                item => item.bookTitle === bookTitle && item.format === format
            );

            if (existingItemIndex !== -1) {
                // Update quantity and price
                userCart.purchases[existingItemIndex].quantity += quantity;
                userCart.purchases[existingItemIndex].Price += Price;
            } else {
                // Add new item to the array
                userCart.purchases.push({ bookTitle, format, quantity, Price });
            }

            await userCart.save();
            return res.status(200).json({ message: "Cart updated successfully!" });
        } else {
            // Create a new cart for the user
            const newCart = new Purchase({
                email,
                purchases: [{ bookTitle, format, quantity, Price }]
            });

            await newCart.save();
            return res.status(201).json({ message: "Cart created and book added!" });
        }
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
        const cart = await Purchase.findOne({ email });
        if (!cart) return res.status(404).json([]);
        res.json(cart.purchases);

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
        const result = await Purchase.updateOne(
            { email },
            { $pull: { purchases: { bookTitle } } }
        );
        

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


// models/Bill.js



const BillSchema = new mongoose.Schema({
    email: {
        unique: true,
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    purchases: [
        {
            bookTitle: { type: String, required: true },
            Price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
}, { collection: "BILL" });

const Bill = mongoose.model('Bill', BillSchema);
app.post('/api/submit-bill', async (req, res) => {
    const { email, location, phone, totalAmount } = req.body;

    try {
        const userCart = await Purchase.findOne({ email });

        if (!userCart || userCart.purchases.length === 0) {
            return res.status(400).json({ message: "No purchases to bill." });
        }

        const bill = new Bill({
            email,
            location,
            phone,
            purchases: userCart.purchases,
            totalAmount,
        });

        await bill.save();
        await Purchase.deleteMany({ email }); // Clear cart after billing

        res.status(200).json({ message: "Bill stored successfully." });
    } catch (err) {
        console.error("Failed to store bill:", err);
        res.status(500).json({ message: "Failed to store bill." });
    }
});

app.get('/api/bills', async (req, res) => {
    const email = req.query.email; // Get email from query parameter
    try {
        // Filter bills by email
        const bills = await Bill.find({ email });
        res.json(bills);
    } catch (err) {
        res.status(500).send('Error fetching bills');
    }
});












//search schema



const searchSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        ref: "UserProfile"
    },
    searchQuery: {
        type: String,
        required: true
    },
    searchBy: {
        type: String,
        enum: ["title", "author"],
        required: true
    },
    searchDate: {
        type: Date,
        default: Date.now
    }

}
    , { collection: "Book" });

const Search = mongoose.model("Search", searchSchema);

// --- Search Endpoint
app.get("/api/search", async (req, res) => {
    const { by, value, customerId } = req.query;

    if (!by || !value) {
        return res.status(400).json({ message: "Missing search parameters" });
    }

    const searchField = by === "author" ? "Book-Author" : "Book-Title";

    try {
        // Query books collection
        const results = await Book.find(
            { [searchField]: { $regex: value, $options: "i" } },
            { "Book-Title": 1, "Image-URL-L": 1, Price: 1, "Book-Author": 1, _id: 0 }
        );

        const formatted = results.map(book => ({
            title: book["Book-Title"],
            imageURLS: { medium: book["Image-URL-L"] },
            Price: book.Price,
            author: book["Book-Author"]
        }));

        // Optional: Log the search
        if (customerId) {
            await Search.create({
                customerId,
                searchQuery: value,
                searchBy: by
            });
        }

        res.json(formatted);
    } catch (err) {
        console.error("❌ Error during search:", err);
        res.status(500).json({ message: "Server error during search" });
    }
});

// ✅ Offer Schema
const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: String,
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    validFrom: {
        type: Date,
        required: true,
    },
    validTo: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"  // Assuming you have a "Book" model
    }]
}, { collection: "Offer" });

const Offer = mongoose.model("Offer", offerSchema);
//  Add a new offer
app.post("/api/offer", async (req, res) => {
    try {
        const { title, description, discountPercentage, validFrom, validTo, isActive, books } = req.body;

        if (!title || discountPercentage === undefined || !validFrom || !validTo) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const newOffer = new Offer({
            title,
            description,
            discountPercentage,
            validFrom,
            validTo,
            isActive,
            books // ✅ this MUST be included
        });

        await newOffer.save();
        res.status(201).json({ message: "Offer created successfully", offer: newOffer });
    } catch (error) {
        console.error("❌ Error adding offer:", error);
        res.status(500).json({ message: "Server error while creating offer" });
    }
});



//  Get all offers
app.get("/api/offers", async (req, res) => {
    try {
        const offers = await Offer.find().populate("books", "title"); // ✅ populates book titles
        res.json(offers);
    } catch (error) {
        console.error("❌ Error fetching offers:", error);
        res.status(500).json({ message: "Server error while fetching offers" });
    }
});



//  Delete an offer by ID
app.delete("/api/offer/:id", async (req, res) => {
    try {
        const result = await Offer.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.json({ message: "Offer deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting offer:", error);
        res.status(500).json({ message: "Server error while deleting offer" });
    }
});
// Get an offer by title
app.get("/api/offer/title/:title", async (req, res) => {
    try {
        const offer = await Offer.findOne({ title: req.params.title });

        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.json(offer);
    } catch (error) {
        console.error("❌ Error fetching offer by title:", error);
        res.status(500).json({ message: "Server error while fetching offer" });
    }
});

//swap

// swap.js
const swapSchema = new mongoose.Schema({
    bookTitle: {
        type: String,
        required: true
    },
    requesterEmail: {
        type: String,
        required: true
    },
    responderEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined", "cancelled"],
        default: "pending"
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "Book"
});

// Optionally enforce uniqueness
swapSchema.index({ bookTitle: 1, requesterEmail: 1, responderEmail: 1 }, { unique: true });

// Add Swap Request
app.post("/api/swap", async (req, res) => {
    try {
        const { bookTitle, requesterEmail, responderEmail } = req.body;

        const requester = await UserProfile.findOne({ email: requesterEmail });
        const responder = await UserProfile.findOne({ email: responderEmail });

        if (!requester || !responder) {
            return res.status(400).json({ message: "Invalid requester or responder email" });
        }

        const swap = new Swap({ bookTitle, requesterEmail, responderEmail });
        await swap.save();

        io.emit("newSwapRequest", swap);

        res.status(201).json({ message: "Swap request created", swap });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ message: "Error creating swap request", error: err.message });
    }
});


// Update Swap Status
app.put("/api/swap/:bookTitle", async (req, res) => {
    const { status, userEmail } = req.body;

    if (!["pending", "accepted", "declined", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const swap = await Swap.findOne({ bookTitle: req.params.bookTitle });

        if (!swap) return res.status(404).json({ message: "Swap not found" });

        if (swap.responderEmail !== userEmail) {
            return res.status(403).json({ message: "Only responder can update status" });
        }

        swap.status = status;
        await swap.save();
        io.emit("swapStatusUpdated", swap);

        res.json(swap);
    } catch (err) {
        res.status(500).json({ message: "Error updating swap", error: err.message });
    }
});

// Get all swaps
app.get("/api/swaps", async (req, res) => {
    try {
        const swaps = await Swap.find()
            .populate("requesterId", "firstName lastName email")
            .populate("responderId", "firstName lastName email");

        res.json(swaps);
    } catch (err) {
        res.status(500).json({ message: "Error fetching swaps" });
    }
});










// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
