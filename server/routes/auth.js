const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = function(db, generateOTP) {
    const router = require('express').Router();

    // Login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        
        const user = db.get('users').find({ email }).value();
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            
            // Return OTP requirement
            res.json({ 
                success: true, 
                requiresOTP: true,
                message: 'Please enter the OTP sent to your email'
            });
        });
    });

    // Verify OTP
    router.post('/verify-otp', (req, res) => {
        const { email, otp } = req.body;
        
        // Check if OTP is valid
        const currentOTP = db.get('otp').value();
        const otpExpires = new Date(db.get('otpExpires').value());
        const now = new Date();
        
        if (otp !== currentOTP || now > otpExpires) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }
        
        // Find user
        const user = db.get('users').find({ email }).value();
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        // Create token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );
        
        res.json({ 
            success: true, 
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                balance: user.balance,
                accountNumber: user.accountNumber
            }
        });
    });

    // Register
    router.post('/register', async (req, res) => {
        const { fullName, email, password, phone } = req.body;
        
        // Check if user exists
        const existingUser = db.get('users').find({ email }).value();
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate account number
        const accountNumber = 'GCU' + Math.floor(100000000 + Math.random() * 900000000);
        
        // Create user
        const user = {
            id: db.get('users').size().value() + 1,
            fullName,
            email,
            password: hashedPassword,
            phone,
            balance: 0,
            accountNumber,
            transactions: [],
            loans: [],
            createdAt: new Date().toISOString()
        };
        
        db.get('users').push(user).write();
        
        res.json({ 
            success: true, 
            message: 'Registration successful',
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                accountNumber: user.accountNumber
            }
        });
    });

    return router;
};
