import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../CSS/Conversation.css";

const socket = io("http://localhost:5000");

const ChatApp = () => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // Simulating a logged-in user (Replace this with actual login logic)
    const loggedInUserId = "67e8e1431dd450aee19c5183"; // ⚠️ Replace with actual logged-in userId

    useEffect(() => {
        fetch("http://localhost:5000/api/users") // Ensure correct API endpoint for active users
            .then((response) => response.json())
            .then((data) => setActiveUsers(data.users || []))
            .catch((error) => console.error("❌ Error fetching active users:", error));

        socket.on("receiveMessage", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setMessages([]); // Clear previous chat
        
        fetch(`http://localhost:5000/api/messages/${loggedInUserId}/${user.customerId}`)
            .then((response) => response.json())
            .then((data) => setMessages(data))
            .catch((error) => console.error("❌ Error fetching messages:", error));
    };

    const sendMessage = async () => {
        if (newMessage.trim() && selectedUser) {
            const messageData = {
                senderId: loggedInUserId,
                receiverId: selectedUser.customerId,
                message: newMessage,
            };

            try {
                const response = await fetch("http://localhost:5000/api/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(messageData),
                });

                if (!response.ok) {
                    throw new Error("Failed to send message");
                }

                const savedMessage = await response.json();
                socket.emit("sendMessage", savedMessage);
                setMessages((prev) => [...prev, savedMessage]);
                setNewMessage("");
            } catch (error) {
                console.error("❌ Error sending message:", error);
            }
        }
    };

    return (
        <div className="chat-container">
            <div className="sBar">
                <h2>Active Users</h2>
                <ul>
                    {activeUsers.length === 0 ? (
                        <li className="no-active-users">No active users</li>
                    ) : (
                        activeUsers.map((user) => (
                            <li key={user.customerId} onClick={() => handleUserClick(user)}>
                                {user.email}
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <div className="chat-section">
                {selectedUser ? (
                    <div className="chat-box">
                        <h3>{selectedUser.email}</h3>
                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={msg.senderId === loggedInUserId ? "message sent" : "message received"}>
                                    {msg.message}
                                </div>
                            ))}
                        </div>
                        <div className="input-container">
                            <input 
                                type="text" 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                                placeholder="Type a message..." 
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                ) : (
                    <div className="no-chat-selected">
                        <h3>Select a user to start chatting</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatApp;