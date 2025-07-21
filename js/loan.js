document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '../login.html';
        return;
    }
    
    // Load current loans
    loadCurrentLoans();
    
    // Apply for loan buttons
    const applyButtons = document.querySelectorAll('.apply-loan');
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const loanType = this.getAttribute('data-type');
            applyForLoan(loanType);
        });
    });
    
    // Function to load current loans
    async function loadCurrentLoans() {
        const loansList = document.querySelector('.loans-list');
        loansList.innerHTML = '<div class="loading">Loading your loans...</div>';
        
        try {
            // In a real app, this would fetch from the backend
            // For now, we'll use mock data
            const mockLoans = [
                {
                    id: 1,
                    type: 'personal',
                    amount: 10000,
                    term: 3,
                    rate: 6.99,
                    status: 'active',
                    startDate: '2023-01-15',
                    monthlyPayment: 308.77,
                    remainingBalance: 8500
                }
            ];
            
            if (mockLoans.length > 0) {
                loansList.innerHTML = '';
                
                mockLoans.forEach(loan => {
                    const loanItem = document.createElement('div');
                    loanItem.className = 'loan-item';
                    
                    loanItem.innerHTML = `
                        <div class="loan-header">
                            <h4>${loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} Loan</h4>
                            <span class="loan-status ${loan.status}">${loan.status}</span>
                        </div>
                        <div class="loan-details">
                            <p><strong>Amount:</strong> $${loan.amount.toLocaleString()}</p>
                            <p><strong>Term:</strong> ${loan.term} years</p>
                            <p><strong>Rate:</strong> ${loan.rate}% APR</p>
                            <p><strong>Monthly Payment:</strong> $${loan.monthlyPayment.toFixed(2)}</p>
                            <p><strong>Remaining Balance:</strong> $${loan.remainingBalance.toLocaleString()}</p>
                        </div>
                    `;
                    
                    loansList.appendChild(loanItem);
                });
            } else {
                loansList.innerHTML = '<div class="loading">You have no active loans</div>';
            }
        } catch (error) {
            console.error('Error loading loans:', error);
            loansList.innerHTML = '<div class="loading">Error loading loans</div>';
        }
    }
    
    // Function to handle loan application
    function applyForLoan(loanType) {
        alert(`Application for ${loanType} loan would be processed here. In a real app, this would submit a loan application form.`);
    }
});
