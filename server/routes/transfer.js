module.exports = function(db) {
    const router = require('express').Router();
    const jwt = require('jsonwebtoken');

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

    // Transfer funds
    router.post('/', authenticateToken, (req, res) => {
        const { recipient, amount, description } = req.body;
        
        if (!recipient || !amount) {
            return res.status(400).json({ success: false, message: 'Recipient and amount are required' });
        }
        
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }
        
        // Find sender
        const sender = db.get('users').find({ email: req.user.email });
        if (!sender.value()) {
            return res.status(404).json({ success: false, message: 'Sender not found' });
        }
        
        // Check sender balance
        if (sender.value().balance < amountNum) {
            return res.status(400).json({ success: false, message: 'Insufficient funds' });
        }
        
        // Find recipient by account number or email
        const recipientUser = db.get('users').find(user => 
            user.accountNumber === recipient || user.email === recipient
        );
        
        if (!recipientUser.value()) {
            return res.status(404).json({ success: false, message: 'Recipient not found' });
        }
        
        if (recipientUser.value().id === sender.value().id) {
            return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
        }
        
        // Perform transfer
        const now = new Date().toISOString();
        const transaction = {
            id: db.get('transactions').size().value() + 1,
            senderId: sender.value().id,
            senderAccount: sender.value().accountNumber,
            recipientId: recipientUser.value().id,
            recipientAccount: recipientUser.value().accountNumber,
            amount: amountNum,
            description: description || 'Funds transfer',
            date: now,
            status: 'completed'
        };
        
        // Update sender balance and add transaction
        sender.assign({
            balance: sender.value().balance - amountNum,
            transactions: [...sender.value().transactions, transaction]
        }).write();
        
        // Update recipient balance and add transaction
        recipientUser.assign({
            balance: recipientUser.value().balance + amountNum,
            transactions: [...recipientUser.value().transactions, {
                ...transaction,
                type: 'credit'
            }]
        }).write();
        
        // Add to global transactions
        db.get('transactions').push(transaction).write();
        
        res.json({ 
            success: true, 
            message: 'Transfer successful',
            transaction
        });
    });

    return router;
};
