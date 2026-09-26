// 1. Translations Dictionary (Urdu aur English ke words)
const translations = {
    en: { 
        title: "Howi Chat", 
        username: "Username", 
        email: "Email", 
        password: "Password", 
        loginBtn: "Login", 
        noAccount: "No account?", 
        signupLink: "Sign Up",
        alreadyAccount: "Already have an account?"
    },
    ur: { 
        title: "ہووی چیٹ", 
        username: "صارف کا نام", 
        email: "ای میل", 
        password: "پاس ورڈ", 
        loginBtn: "لاگ ان", 
        noAccount: "اکاؤنٹ نہیں ہے؟", 
        signupLink: "سائن اپ کریں",
        alreadyAccount: "پہلے سے اکاؤنٹ ہے؟"
    }
};

// Variables
let isLoginMode = true; // Shuru mein Login mode ON rahega

// 2. Language Change karne ka function
function setLanguage(lang) {
    // RTL (Urdu) ke liye class lagana ya hatana
    if (lang === 'ur') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }

    // Text ko update karna
    document.getElementById('app-title').innerText = translations[lang].title;
    document.getElementById('username').placeholder = translations[lang].username;
    document.getElementById('email').placeholder = translations[lang].email;
    document.getElementById('password').placeholder = translations[lang].password;
    document.getElementById('login-btn').innerText = translations[lang].loginBtn;
    
    // Toggle text ko update karna (Login ya Signup ke hisaab se)
    if (isLoginMode) {
        document.getElementById('no-account').innerText = translations[lang].noAccount;
        document.getElementById('signup-link').innerText = translations[lang].signupLink;
    } else {
        document.getElementById('no-account').innerText = translations[lang].alreadyAccount;
        document.getElementById('signup-link').innerText = translations[lang].loginBtn;
    }
}

// 3. Login aur Signup ke darmiyan switch karne ka function
document.getElementById('signup-link').addEventListener('click', function(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode; // Mode palat do
    
    const btn = document.getElementById('login-btn');
    const toggleSpan = document.getElementById('no-account');
    const toggleLink = document.getElementById('signup-link');
    const currentLang = document.body.classList.contains('rtl') ? 'ur' : 'en';

    if (isLoginMode) {
        btn.innerText = translations[currentLang].loginBtn;
        toggleSpan.innerText = translations[currentLang].noAccount;
        toggleLink.innerText = translations[currentLang].signupLink;
    } else {
        btn.innerText = "Sign Up";
        toggleSpan.innerText = translations[currentLang].alreadyAccount;
        toggleLink.innerText = translations[currentLang].loginBtn;
    }
});

// 4. Form Submit (Login/Signup) ka asal logic
document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Page ko reload hone se rokna
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    errorMsg.innerText = ""; // Purane error clear karna

    if (isLoginMode) {
        // === LOGIN LOGIC ===
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert("Login Successful! Welcome " + userCredential.user.email);
                // Yahan hum agla step karenge (Chat Screen par bhejna)
            })
            .catch((error) => {
                errorMsg.innerText = "Error: " + error.message;
            });
    } else {
        // === SIGN UP LOGIC ===
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert("Account Created Successfully! Welcome " + userCredential.user.email);
                // Yahan hum agla step karenge (Chat Screen par bhejna)
            })
            .catch((error) => {
                errorMsg.innerText = "Error: " + error.message;
            });
    }
});

// 5. Default Language set karna (Shuru mein English)
setLanguage('en');
