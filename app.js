/* ==========================================================
   HOWI CHAT - Authentication Logic
   ========================================================== */

const translations = {
    en: {
        title: "Howi Chat",
        loginBtn: "Login",
        signupBtn: "Sign Up",
        noAccount: "No account?",
        signupLink: "Sign Up",
        alreadyAccount: "Already have an account?",
        loginLink: "Login"
    },
    ur: {
        title: "ہووی چیٹ",
        loginBtn: "لاگ ان",
        signupBtn: "سائن اپ",
        noAccount: "اکاؤنٹ نہیں ہے؟",
        signupLink: "سائن اپ کریں",
        alreadyAccount: "پہلے سے اکاؤنٹ ہے؟",
        loginLink: "لاگ ان کریں"
    }
};

let isLoginMode = true;

function setLanguage(lang) {
    if (lang === 'ur') document.body.classList.add('rtl');
    else document.body.classList.remove('rtl');

    const t = translations[lang];
    document.getElementById('app-title').innerText = t.title;
    document.getElementById('error-msg').innerText = "";
    
    if (isLoginMode) {
        document.getElementById('login-btn').innerText = t.loginBtn;
        document.getElementById('no-account').innerText = t.noAccount;
        document.getElementById('signup-link').innerText = t.signupLink;
    } else {
        document.getElementById('login-btn').innerText = t.signupBtn;
        document.getElementById('no-account').innerText = t.alreadyAccount;
        document.getElementById('signup-link').innerText = t.loginLink;
    }
}

document.getElementById('signup-link').addEventListener('click', function(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    document.getElementById('error-msg').innerText = "";
    const lang = document.body.classList.contains('rtl') ? 'ur' : 'en';
    setLanguage(lang);
});

document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    const submitBtn = document.getElementById('login-btn');

    errorMsg.innerText = "";
    
    // Validation
    if (password.length < 6) {
        errorMsg.style.color = "#e74c3c";
        errorMsg.innerText = "Password must be at least 6 characters.";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Please wait...";

    if (isLoginMode) {
        // LOGIN
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch((error) => {
                errorMsg.style.color = "#e74c3c";
                errorMsg.innerText = getErrorMessage(error.code);
                submitBtn.disabled = false;
                setLanguage(document.body.classList.contains('rtl') ? 'ur' : 'en');
            });
    } else {
        // SIGNUP
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Fire and forget - background save
                firebase.firestore().collection('users').doc(user.uid).set({
                    email: user.email,
                    uid: user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(err => console.log("DB save error:", err));
            })
            .catch((error) => {
                errorMsg.style.color = "#e74c3c";
                errorMsg.innerText = getErrorMessage(error.code);
                submitBtn.disabled = false;
                setLanguage(document.body.classList.contains('rtl') ? 'ur' : 'en');
            });
    }
});

function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'This email is already registered. Please login.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try later.',
        'auth/network-request-failed': 'Network error. Check your internet.'
    };
    return messages[code] || 'Something went wrong. Please try again.';
}

// Auto-redirect if already logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.location.href = "chat.html";
    }
});

setLanguage('en');
