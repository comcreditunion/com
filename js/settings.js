document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '../login.html';
        return;
    }
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Load profile data
    document.getElementById('fullName').value = user.fullName;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('accountNumber').value = user.accountNumber;
    
    // Profile form handling
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            
            const saveBtn = this.querySelector('button[type="submit"]');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            
            try {
                const response = await fetch('/user/settings', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ fullName, phone })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Profile updated successfully');
                    
                    // Update local user data
                    user.fullName = fullName;
                    user.phone = phone;
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    alert(data.message || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Profile update error:', error);
                alert('An error occurred while updating profile');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';
            }
        });
    }
    
    // Password validation
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    
    const validatePassword = () => {
        const password = newPasswordInput.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        // Update requirement indicators
        Object.keys(requirements).forEach(key => {
            const element = document.getElementById('sec-' + key);
            if (element) {
                if (requirements[key]) {
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                }
            }
        });
        
        // Confirm password match
        if (confirmPasswordInput.value && password !== confirmPasswordInput.value) {
            document.getElementById('confirm-new-error').textContent = 'Passwords do not match';
            document.getElementById('confirm-new-error').style.display = 'block';
        } else {
            document.getElementById('confirm-new-error').style.display = 'none';
        }
        
        return Object.values(requirements).every(Boolean);
    };
    
    newPasswordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validatePassword);
    
    // Password form handling
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            // Clear previous errors
            document.getElementById('current-password-error').style.display = 'none';
            document.getElementById('new-password-error').style.display = 'none';
            document.getElementById('confirm-new-error').style.display = 'none';
            
            // Validation
            let isValid = true;
            
            if (!currentPassword) {
                document.getElementById('current-password-error').textContent = 'Current password is required';
                document.getElementById('current-password-error').style.display = 'block';
                isValid = false;
            }
            
            if (!newPassword) {
                document.getElementById('new-password-error').textContent = 'New password is required';
                document.getElementById('new-password-error').style.display = 'block';
                isValid = false;
            } else if (!validatePassword()) {
                document.getElementById('new-password-error').textContent = 'Password does not meet requirements';
                document.getElementById('new-password-error').style.display = 'block';
                isValid = false;
            }
            
            if (newPassword !== confirmNewPassword) {
                document.getElementById('confirm-new-error').textContent = 'Passwords do not match';
                document.getElementById('confirm-new-error').style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            const saveBtn = this.querySelector('button[type="submit"]');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Changing...';
            
            try {
                const response = await fetch('/user/settings', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Password changed successfully');
                    passwordForm.reset();
                } else {
                    alert(data.message || 'Failed to change password');
                }
            } catch (error) {
                console.error('Password change error:', error);
                alert('An error occurred while changing password');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Change Password';
            }
        });
    }
    
    // Preferences form handling
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Preferences would be saved here in a real application');
        });
    }
});
