/* ==========================================================
   HOWI CHAT - Authentication Logic (Fixed Version)
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

document.getElementById('auth-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    const submitBtn = document.getElementById('login-btn');
    const currentLang = document.body.classList.contains('rtl') ? 'ur' : 'en';

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
        // ============ LOGIN ============
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Check karo ke Firestore mein user hai ya nahi
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Agar nahi hai to banao
                await firebase.firestore().collection('users').doc(user.uid).set({
                    email: user.email,
                    uid: user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Ab chat page pe jao
            window.location.href = "chat.html";
            
        } catch (error) {
            errorMsg.style.color = "#e74c3c";
            errorMsg.innerText = getErrorMessage(error.code);
            submitBtn.disabled = false;
            setLanguage(currentLang);
        }
    } else {
        // ============ SIGNUP ============
        try {
            // Step 1: Firebase Auth mein account banao
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Step 2: Firestore mein user ka data save karo (AWAIT ke saath)
            await firebase.firestore().collection('users').doc(user.uid).set({
                email: user.email,
                uid: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Step 3: Data save hone ke baad chat page pe bhejo
            window.location.href = "chat.html";
            
        } catch (error) {
            console.error("Signup error:", error);
            errorMsg.style.color = "#e74c3c";
            errorMsg.innerText = getErrorMessage(error.code);
            submitBtn.disabled = false;
            setLanguage(currentLang);
        }
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
        'auth/network-request-failed': 'Network error. Check your internet.',
        'permission-denied': 'Database permission denied. Please check Firebase rules.'
    };
    return messages[code] || 'Something went wrong. Please try again.';
}

// ============ AUTO REDIRECT IF LOGGED IN ============
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Check karo ke Firestore mein user ka data hai ya nahi
        try {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Agar nahi hai to banao (purane users ke liye)
                await firebase.firestore().collection('users').doc(user.uid).set({
                    email: user.email,
                    uid: user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Ab chat page pe jao (agar pehle se chat page pe nahi ho)
            if (window.location.pathname.indexOf('chat.html') === -1) {
                window.location.href = "chat.html";
            }
        } catch (err) {
            console.error("Auto redirect error:", err);
        }
    }
});

// Start with English
setLanguage('en');
