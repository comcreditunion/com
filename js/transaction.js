document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '../login.html';
        return;
    }
    
    // Load transactions
    loadTransactions();
    
    // Filter transactions
    const transactionFilter = document.getElementById('transactionFilter');
    if (transactionFilter) {
        transactionFilter.addEventListener('change', function() {
            loadTransactions(this.value);
        });
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTransactions);
    }
    
    // Function to load transactions with optional filter
    async function loadTransactions(filter = 'all') {
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
                    
                    // Filter transactions if needed
                    let transactions = data.transactions;
                    if (filter === 'credit') {
                        transactions = transactions.filter(t => t.recipientAccount === user.accountNumber);
                    } else if (filter === 'debit') {
                        transactions = transactions.filter(t => t.senderAccount === user.accountNumber);
                    }
                    
                    if (transactions.length === 0) {
                        transactionsList.innerHTML = '<div class="loading">No transactions match your filter</div>';
                        return;
                    }
                    
                    transactions.forEach(transaction => {
                        const isCredit = transaction.recipientAccount === user.accountNumber;
                        const transactionItem = document.createElement('div');
                        transactionItem.className = 'transaction-item';
                        
                        transactionItem.innerHTML = `
                            <div class="transaction-details">
                                <div class="transaction-title">${transaction.description || 'Funds Transfer'}</div>
                                <div class="transaction-date">${new Date(transaction.date).toLocaleString()}</div>
                                <div class="transaction-account">
                                    ${isCredit ? 'From: ' + transaction.senderAccount : 'To: ' + transaction.recipientAccount}
                                </div>
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
    
    // Function to export transactions
    function exportTransactions() {
        alert('Export functionality would be implemented here. In a real app, this would generate a CSV or PDF file.');
    }
});
