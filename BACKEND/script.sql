CREATE TABLE UserProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    mobileNumber VARCHAR(20),
    gender VARCHAR(10),
    country VARCHAR(100),
    address TEXT,
    profileImage VARCHAR(255),
    activity BOOLEAN DEFAULT FALSE
);
-- 1. Check if user exists
SELECT * FROM UserProfile WHERE email = 'amir@gmail.com';

-- 2. If not exists, insert
INSERT INTO UserProfile (customerId, email, activity)
VALUES ('generated-uuid', 'user@example.com', TRUE);


UPDATE UserProfile
SET firstName = 'John', lastName = 'Doe', country = 'USA'
WHERE customerId = 'given-customer-id';

SELECT * FROM UserProfile WHERE customerId = 'given-customer-id';



