// 1. DATA ROUTING ENDPOINT STRUCTS LINKED TO YOUR INSTANCE
const authClient = window.supabaseAuthClient || window.supabaseClient || null;

if (!authClient) {
    throw new Error('Supabase client module infrastructure could not be loaded into memory context.');
}

// Upgraded Blocker: Verifies if the session is ACTUALLY valid on the database side
async function checkExistingSession() {
    const { data: { session }, error } = await authClient.auth.getSession();
    
    // If a session exists, double check with Supabase that the user wasn't deleted
    if (session) {
        const { data: { user }, error: userError } = await authClient.auth.getUser();
        
        if (userError || !user) {
            // The user was deleted from the dashboard! Clear out the broken local memory tokens
            await authClient.auth.signOut();
            return; 
        }
        
        // If the user is verified and completely valid, let them pass to home
        window.location.href = 'home.html';
    }
}
checkExistingSession();

// 3. INTERFACE ELEMENT TOGGLE TRIGGERS
function switchAuthView(viewMode) {
    const loginForm = document.getElementById('form-login-block');
    const registerForm = document.getElementById('form-register-block');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');

    if (viewMode === 'login') {
        loginForm.classList.remove('hidden-panel');
        registerForm.classList.add('hidden-panel');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden-panel');
        registerForm.classList.remove('hidden-panel');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// 4. ENFORCE PASSWORD ALPHANUMERIC STRUCTURAL POLICY
function checkPasswordIsSecureAndMixed(passwordText) {
    if (passwordText.length < 6) return false;

    // Verify presence of at least one letter and one digit
    const hasLetters = /[a-zA-Z]/.test(passwordText);
    const hasNumbers = /[0-9]/.test(passwordText);

    return hasLetters && hasNumbers;
}

// 5. SECURE REGISTRATION FLOW METHOD
async function executeCustomerRegistration(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    // Check A: Verify passwords match identically
    if (password !== confirmPassword) {
        alert("VALIDATION ERROR: Passwords do not match. Please verify your typing.");
        return;
    }

    // Check B: Strict structural requirement configuration validation mix check (Letters + Numbers)
    if (!checkPasswordIsSecureAndMixed(password)) {
        alert("SECURITY COMPLEXITY FAULT: Your password must be at least 6 characters long and must contain a mixture of both letters and numbers.");
        return;
    }

    // Initialize account authentication context inside standard user store container schemas
    const { data: authData, error: authError } = await authClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { display_name: name }
        }
    });

    if (authError) {
        alert("Account Creation Denied: " + authError.message);
        return;
    }

    if (authData.user) {
        alert("Welcome to Platinum Liquors! Registration processing complete.");
        window.location.href = 'home.html'; 
    }
}

// 6. RETURNING ACCESS VALIDATION CHECKS
async function executeCustomerLogin(event) {
    event.preventDefault();
    
    const emailField = document.getElementById('login-email').value.trim();
    const passwordField = document.getElementById('login-password').value;

    const { data, error } = await authClient.auth.signInWithPassword({
        email: emailField,
        password: passwordField
    });

    if (error) {
        alert("Authentication Blocked: " + error.message);
        return;
    }

    alert("Welcome Back!");
    window.location.href = 'home.html'; 
}