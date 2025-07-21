const jwt = require('jsonwebtoken');

module.exports = function(db) {
    const router = require('express').Router();

    // Middleware to verify JWT
    function authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    }

    // Get user data
    router.get('/me', authenticateToken, (req, res) => {
        const user = db.get('users').find({ email: req.user.email }).value();
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                balance: user.balance,
                accountNumber: user.accountNumber,
                createdAt: user.createdAt
            }
        });
    });

    // Update user settings
    router.put('/settings', authenticateToken, async (req, res) => {
        const { fullName, phone, currentPassword, newPassword } = req.body;
        const user = db.get('users').find({ email: req.user.email });
        
        if (!user.value()) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const updates = {};
        
        if (fullName) updates.fullName = fullName;
        if (phone) updates.phone = phone;
        
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Current password is required' });
            }
            
            const isMatch = await bcrypt.compare(currentPassword, user.value().password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }
            
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(newPassword, salt);
        }
        
        user.assign(updates).write();
        
        res.json({ 
            success: true, 
            message: 'Settings updated successfully'
        });
    });

    // Get transactions
    router.get('/transactions', authenticateToken, (req, res) => {
        const user = db.get('users').find({ email: req.user.email }).value();
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            transactions: user.transactions
        });
    });

    return router;
};
