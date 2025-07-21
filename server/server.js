require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize database
const adapter = new FileSync('server/models/db.json');
const db = low(adapter);

// Set some defaults if database is empty
db.defaults({
    users: [
        {
            id: 1,
            fullName: "Laura Jewelry Co",
            email: "laurajewelryco@artlover.com",
            password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrU7rplM1QYDFQj4ChBjB7WuF5qR6qO", // Goodvibesonly12
            phone: "+1234567890",
            balance: 890000,
            accountNumber: "GCU123456789",
            transactions: [],
            loans: [],
            createdAt: new Date().toISOString()
        }
    ],
    transactions: [],
    otp: null,
    otpExpires: null
}).write();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../')));

// Generate OTP based on current date
function generateOTP() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}${month}${year % 100}`.slice(0, 6).padStart(6, '0');
}

// Routes
app.use('/auth', require('./routes/auth')(db, generateOTP));
app.use('/user', require('./routes/user')(db));
app.use('/transfer', require('./routes/transfer')(db));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Generate initial OTP
    const otp = generateOTP();
    db.set('otp', otp).write();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);
    db.set('otpExpires', expires.toISOString()).write();
    console.log(`Today's OTP: ${otp} (valid until ${expires.toLocaleTimeString()})`);
});

module.exports = { app, db, generateOTP };
