document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '../login.html';
        return;
    }
    
    // Display user info
    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('accountNumber').textContent = user.accountNumber;
    document.getElementById('balanceAmount').textContent = `$${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Load transactions
    loadTransactions();
    
    // Logout button
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../login.html';
        });
    }
    
    // Function to load transactions
    async function loadTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        transactionsList.innerHTML = '<div class="loading">Loading transactions...</div>';
        
        try {
            const response = await fetch('/user/transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.transactions.length > 0) {
                    transactionsList.innerHTML = '';
                    
                    // Show only the last 5 transactions
                    const recentTransactions = data.transactions.slice(0, 5);
                    
                    recentTransactions.forEach(transaction => {
                        const isCredit = transaction.recipientAccount === user.accountNumber;
                        const transactionItem = document.createElement('div');
                        transactionItem.className = 'transaction-item';
                        
                        transactionItem.innerHTML = `
                            <div class="transaction-details">
                                <div class="transaction-title">${transaction.description || 'Funds Transfer'}</div>
                                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
                            </div>
                            <div class="transaction-amount ${isCredit ? 'credit' : 'debit'}">
                                ${isCredit ? '+' : '-'}$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        `;
                        
                        transactionsList.appendChild(transactionItem);
                    });
                } else {
                    transactionsList.innerHTML = '<div class="loading">No transactions found</div>';
                }
            } else {
                transactionsList.innerHTML = '<div class="loading">Error loading transactions</div>';
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            transactionsList.innerHTML = '<div class="loading">Error loading transactions</div>';
        }
    }
    
    // Periodically check token validity
    setInterval(async () => {
        try {
            const response = await fetch('/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../login.html';
            }
        } catch (error) {
            console.error('Token check failed:', error);
        }
    }, 300000); // Check every 5 minutes
});
