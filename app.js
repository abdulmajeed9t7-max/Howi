// 1. Translations Dictionary
const translations = {
    en: { title: "Howi Chat", username: "Username", email: "Email", password: "Password", loginBtn: "Login", noAccount: "No account?", signupLink: "Sign Up", alreadyAccount: "Already have an account?" },
    ur: { title: "ہووی چیٹ", username: "صارف کا نام", email: "ای میل", password: "پاس ورڈ", loginBtn: "لاگ ان", noAccount: "اکاؤنٹ نہیں ہے؟", signupLink: "سائن اپ کریں", alreadyAccount: "پہلے سے اکاؤنٹ ہے؟" }
};

let isLoginMode = true;

// Firestore Check (Agar load nahi hua to error na de)
let db;
if (typeof firebase.firestore !== 'undefined') {
    db = firebase.firestore();
} else {
    console.log("Firestore load nahi hua, lekin app chalegi.");
}

// 2. Language Change Function
function setLanguage(lang) {
    if (lang === 'ur') document.body.classList.add('rtl');
    else document.body.classList.remove('rtl');

    document.getElementById('app-title').innerText = translations[lang].title;
    document.getElementById('username').placeholder = translations[lang].username;
    document.getElementById('email').placeholder = translations[lang].email;
    document.getElementById('password').placeholder = translations[lang].password;
    document.getElementById('login-btn').innerText = isLoginMode ? translations[lang].loginBtn : "Sign Up";
    
    if (isLoginMode) {
        document.getElementById('no-account').innerText = translations[lang].noAccount;
        document.getElementById('signup-link').innerText = translations[lang].signupLink;
    } else {
        document.getElementById('no-account').innerText = translations[lang].alreadyAccount;
        document.getElementById('signup-link').innerText = translations[lang].loginBtn;
    }
}

// 3. Login/Signup Toggle
document.getElementById('signup-link').addEventListener('click', function(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    document.getElementById('error-msg').innerText = "";
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

// 4. Form Submit Logic
document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    errorMsg.innerText = "Processing..."; // User ko batayein ke kaam ho raha hai
    errorMsg.style.color = "blue";

    if (isLoginMode) {
        // === LOGIN ===
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = "chat.html";
            })
            .catch((error) => {
                errorMsg.style.color = "red";
                errorMsg.innerText = "Error: " + error.message;
            });
    } else {
        // === SIGN UP ===
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Agar database load hai to data save karein
                if (db) {
                    db.collection('users').doc(user.uid).set({
                        email: user.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        window.location.href = "chat.html";
                    }).catch((dbError) => {
                        errorMsg.style.color = "orange";
                        errorMsg.innerText = "Account ban gaya, lekin database save nahi hua. Aage barh rahe hain...";
                        setTimeout(() => { window.location.href = "chat.html"; }, 1500);
                    });
                } else {
                    // Agar database load nahi hua, to phir bhi aage barhein
                    window.location.href = "chat.html";
                }
            })
            .catch((error) => {
                errorMsg.style.color = "red";
                errorMsg.innerText = "Error: " + error.message;
            });
    }
});

setLanguage('en');
