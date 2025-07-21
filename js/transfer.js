document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '../login.html';
        return;
    }
    
    // Display balance
    document.getElementById('balanceAmount').textContent = `$${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Transfer form handling
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const recipient = document.getElementById('recipient').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const description = document.getElementById('description').value;
            
            // Clear previous errors
            document.getElementById('recipient-error').style.display = 'none';
            document.getElementById('amount-error').style.display = 'none';
            
            // Validation
            let isValid = true;
            
            if (!recipient) {
                document.getElementById('recipient-error').textContent = 'Recipient is required';
                document.getElementById('recipient-error').style.display = 'block';
                isValid = false;
            }
            
            if (!amount || isNaN(amount) || amount <= 0) {
                document.getElementById('amount-error').textContent = 'Please enter a valid amount';
                document.getElementById('amount-error').style.display = 'block';
                isValid = false;
            } else if (amount > 10000) {
                document.getElementById('amount-error').textContent = 'Maximum transfer amount is $10,000';
                document.getElementById('amount-error').style.display = 'block';
                isValid = false;
            } else if (amount > user.balance) {
                document.getElementById('amount-error').textContent = 'Insufficient funds';
                document.getElementById('amount-error').style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            const transferBtn = document.getElementById('transferBtn');
            transferBtn.disabled = true;
            transferBtn.textContent = 'Processing...';
            
            try {
                const response = await fetch('/transfer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ recipient, amount, description })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Transfer successful!');
                    
                    // Update local user balance
                    user.balance -= amount;
                    localStorage.setItem('user', JSON.stringify(user));
                    document.getElementById('balanceAmount').textContent = `$${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    
                    // Reset form
                    transferForm.reset();
                } else {
                    alert(data.message || 'Transfer failed');
                }
            } catch (error) {
                console.error('Transfer error:', error);
                alert('An error occurred during transfer');
            } finally {
                transferBtn.disabled = false;
                transferBtn.textContent = 'Transfer';
            }
        });
    }
});
