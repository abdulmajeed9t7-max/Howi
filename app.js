// 1. Translations Dictionary (Urdu aur English ke words)
const translations = {
    en: { 
        title: "Howi", 
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

// Variable to track Login/Signup mode
let isLoginMode = true; 
const db = firebase.firestore(); // Firestore initialize

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
    document.getElementById('login-btn').innerText = isLoginMode ? translations[lang].loginBtn : "Sign Up";
    
    // Toggle text ko update karna
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
    
    // Error message clear karein
    document.getElementById('error-msg').innerText = "";

    // Current language check karein
    const currentLang = document.body.classList.contains('rtl') ? 'ur' : 'en';

    if (isLoginMode) {
        document.getElementById('login-btn').innerText = translations[currentLang].loginBtn;
        document.getElementById('no-account').innerText = translations[currentLang].noAccount;
        document.getElementById('signup-link').innerText = translations[currentLang].signupLink;
    } else {
        document.getElementById('login-btn').innerText = "Sign Up";
        document.getElementById('no-account').innerText = translations[currentLang].alreadyAccount;
        document.getElementById('signup-link').innerText = translations[currentLang].loginBtn;
    }
});

// 4. Form Submit (Login/Signup) ka asal logic
document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Page ko reload hone se rokna
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    errorMsg.innerText = ""; // Purane error clear karna

    // Firebase check karein ke load hua ya nahi
    if (typeof firebase === 'undefined') {
        errorMsg.style.color = "red";
        errorMsg.innerText = "Error: Firebase load nahi hua. Internet check karein.";
        return;
    }

    if (isLoginMode) {
        // === LOGIN LOGIC ===
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Login hone par Chat Screen par bhejein
                window.location.href = "chat.html";
            })
            .catch((error) => {
                errorMsg.style.color = "red";
                errorMsg.innerText = "Error: " + error.message;
            });
    } else {
        // === SIGN UP LOGIC ===
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
    // User ka data Firestore mein save karein
    const user = userCredential.user;
    db.collection('users').doc(user.uid).set({
        email: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // Data save hone ke baad chat screen par bhejein
        window.location.href = "chat.html";
    });
})
    }
});

// 5. Default Language set karna (Shuru mein English)
setLanguage('en');
