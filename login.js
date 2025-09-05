document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');

    // Check if already logged in (only on login page)
    if (window.location.pathname.includes('login.html') && localStorage.getItem('isLoggedIn') === 'true') {
        window.location.replace('app.html');
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Disable button during login attempt
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        // Simple authentication check
        if (username === 'teacher' && password === 'bennie123') {
            // Store login status
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().getTime());
            
            // Redirect to main app
            window.location.replace('app.html');
        } else {
            // Show error
            errorMessage.textContent = 'Invalid username or password';
            errorMessage.style.display = 'block';
            
            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
    });
});