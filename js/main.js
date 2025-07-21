document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            this.classList.toggle('active');
        });
    }

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const otp = document.getElementById('otp') ? document.getElementById('otp').value : null;
            
            // Clear previous errors
            document.getElementById('email-error').style.display = 'none';
            document.getElementById('password-error').style.display = 'none';
            if (document.getElementById('otp-error')) {
                document.getElementById('otp-error').style.display = 'none';
            }
            
            // Basic validation
            let isValid = true;
            
            if (!email) {
                document.getElementById('email-error').textContent = 'Email is required';
                document.getElementById('email-error').style.display = 'block';
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                document.getElementById('email-error').textContent = 'Email is invalid';
                document.getElementById('email-error').style.display = 'block';
                isValid = false;
            }
            
            if (!password) {
                document.getElementById('password-error').textContent = 'Password is required';
                document.getElementById('password-error').style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.disabled = true;
            loginBtn.textContent = 'Processing...';
            
            try {
                if (!otp) {
                    // First step - verify credentials
                    const response = await fetch('/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Show OTP field
                        document.getElementById('otpGroup').style.display = 'block';
                        loginBtn.textContent = 'Verify OTP';
                    } else {
                        alert(data.message || 'Login failed');
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Login';
                    }
                } else {
                    // Second step - verify OTP
                    const response = await fetch('/auth/verify-otp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, otp })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Store token and user data
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        
                        // Redirect to dashboard
                        window.location.href = 'dashboard/index.html';
                    } else {
                        document.getElementById('otp-error').textContent = data.message || 'Invalid OTP';
                        document.getElementById('otp-error').style.display = 'block';
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Verify OTP';
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login');
                loginBtn.disabled = false;
                loginBtn.textContent = otp ? 'Verify OTP' : 'Login';
            }
        });
    }

    // Registration form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Password validation
        const passwordInput = document.getElementById('regPassword');
        const confirmInput = document.getElementById('confirmPassword');
        
        const validatePassword = () => {
            const password = passwordInput.value;
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };
            
            // Update requirement indicators
            Object.keys(requirements).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (requirements[key]) {
                        element.classList.add('valid');
                    } else {
                        element.classList.remove('valid');
                    }
                }
            });
            
            // Confirm password match
            if (confirmInput.value && password !== confirmInput.value) {
                document.getElementById('confirm-error').textContent = 'Passwords do not match';
                document.getElementById('confirm-error').style.display = 'block';
            } else {
                document.getElementById('confirm-error').style.display = 'none';
            }
            
            return Object.values(requirements).every(Boolean);
        };
        
        passwordInput.addEventListener('input', validatePassword);
        confirmInput.addEventListener('input', validatePassword);
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const phone = document.getElementById('phone').value;
            
            // Clear previous errors
            document.getElementById('name-error').style.display = 'none';
            document.getElementById('reg-email-error').style.display = 'none';
            document.getElementById('reg-password-error').style.display = 'none';
            document.getElementById('confirm-error').style.display = 'none';
            document.getElementById('phone-error').style.display = 'none';
            
            // Validation
            let isValid = true;
            
            if (!fullName) {
                document.getElementById('name-error').textContent = 'Full name is required';
                document.getElementById('name-error').style.display = 'block';
                isValid = false;
            }
            
            if (!email) {
                document.getElementById('reg-email-error').textContent = 'Email is required';
                document.getElementById('reg-email-error').style.display = 'block';
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                document.getElementById('reg-email-error').textContent = 'Email is invalid';
                document.getElementById('reg-email-error').style.display = 'block';
                isValid = false;
            }
            
            if (!password) {
                document.getElementById('reg-password-error').textContent = 'Password is required';
                document.getElementById('reg-password-error').style.display = 'block';
                isValid = false;
            } else if (!validatePassword()) {
                document.getElementById('reg-password-error').textContent = 'Password does not meet requirements';
                document.getElementById('reg-password-error').style.display = 'block';
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                document.getElementById('confirm-error').textContent = 'Passwords do not match';
                document.getElementById('confirm-error').style.display = 'block';
                isValid = false;
            }
            
            if (!phone) {
                document.getElementById('phone-error').textContent = 'Phone number is required';
                document.getElementById('phone-error').style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';
            
            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fullName, email, password, phone })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Registration successful! You can now login.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Registration failed');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Register';
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('An error occurred during registration');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }
});
