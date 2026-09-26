/* ==========================================================
   HOWI CHAT - Chat Logic (Full Fixed Version)
   ========================================================== */

let currentUser = null;
let currentChatId = null;
let currentFriend = null;
let messagesUnsubscribe = null;
let currentLang = 'en';

// ==========================================================
// DEBUG TEST - Ye check karega ke Firestore save ho raha hai ya nahi
// (Jab test ho jaye, ise baad mein hata denge)
// ==========================================================
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("User logged in:", user.email);
        firebase.firestore().collection('users').doc(user.uid).set({
            email: user.email,
            uid: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("✅ Database mein save ho gaya:", user.email);
        }).catch((err) => {
            console.error("❌ Database save FAIL:", err.message);
            alert("DB Error: " + err.message);
        });
    }
});

const chatTranslations = {
    en: {
        headerTitle: "Howi Chat",
        friends: "Friends",
        loading: "Loading...",
        noFriends: "No other users yet. Invite your friends!",
        typeMsg: "Type a message...",
        logout: "Logout"
    },
    ur: {
        headerTitle: "ہووی چیٹ",
        friends: "دوست",
        loading: "لوڈ ہو رہا ہے...",
        noFriends: "ابھی کوئی اور صارف نہیں۔ اپنے دوستوں کو مدعو کریں!",
        typeMsg: "پیغام لکھیں...",
        logout: "لاگ آؤٹ"
    }
};

function applyLang(lang) {
    currentLang = lang;
    if (lang === 'ur') document.body.classList.add('rtl');
    else document.body.classList.remove('rtl');

    const t = chatTranslations[lang];
    document.getElementById('header-title').innerText = t.headerTitle;
    document.getElementById('friends-title').innerText = t.friends;
    document.getElementById('logout-btn').innerText = t.logout;
    document.getElementById('message-input').placeholder = t.typeMsg;
    document.getElementById('lang-toggle').innerText = lang === 'en' ? 'اردو' : 'EN';

    loadFriends();
}

document.getElementById('lang-toggle').addEventListener('click', () => {
    applyLang(currentLang === 'en' ? 'ur' : 'en');
});

document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    });
});

document.getElementById('back-btn').addEventListener('click', () => {
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = null;
    }
    currentChatId = null;
    currentFriend = null;
    document.getElementById('chat-view').classList.add('hidden');
    document.getElementById('friends-view').classList.remove('hidden');
});

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text || !currentChatId || !currentUser) return;

    input.value = "";

    firebase.firestore()
        .collection('chats')
        .doc(currentChatId)
        .collection('messages')
        .add({
            text: text,
            senderId: currentUser.uid,
            senderEmail: currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .catch((err) => {
            console.error("Send error:", err);
            alert("Message send nahi hua: " + err.message);
        });
}

function loadFriends() {
    if (!currentUser) return;
    
    const listEl = document.getElementById('friends-list');
    const t = chatTranslations[currentLang];

    firebase.firestore().collection('users').onSnapshot((snapshot) => {
        listEl.innerHTML = "";
        let hasFriends = false;

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.uid && data.uid !== currentUser.uid) {
                hasFriends = true;
                listEl.appendChild(createFriendItem(data));
            }
        });

        if (!hasFriends) {
            listEl.innerHTML = `<div class="no-friends">${t.noFriends}</div>`;
        }
    }, (error) => {
        console.error("Friends load error:", error);
        listEl.innerHTML = `<div class="no-friends">Error: ${error.message}</div>`;
    });
}

function createFriendItem(friend) {
    const div = document.createElement('div');
    div.className = 'friend-item';

    const initial = (friend.email || '?').charAt(0).toUpperCase();

    div.innerHTML = `
        <div class="friend-avatar">${initial}</div>
        <div class="friend-details">
            <div class="friend-name">${friend.email}</div>
            <div class="friend-sub">Tap to chat</div>
        </div>
    `;

    div.addEventListener('click', () => openChat(friend));
    return div;
}

function openChat(friend) {
    currentFriend = friend;
    const ids = [currentUser.uid, friend.uid].sort();
    currentChatId = ids[0] + "_" + ids[1];

    document.getElementById('chat-with-name').innerText = friend.email;
    document.getElementById('chat-view').classList.remove('hidden');
    document.getElementById('friends-view').classList.add('hidden');

    loadMessages();
}

function loadMessages() {
    const area = document.getElementById('messages-area');
    area.innerHTML = "";

    if (messagesUnsubscribe) messagesUnsubscribe();

    messagesUnsubscribe = firebase.firestore()
        .collection('chats')
        .doc(currentChatId)
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .onSnapshot((snapshot) => {
            area.innerHTML = "";
            if (snapshot.empty) {
                area.innerHTML = `<div class="loading-text">No messages yet. Say hi!</div>`;
                return;
            }
            snapshot.forEach((doc) => {
                const msg = doc.data();
                area.appendChild(createMessageElement(msg));
            });
            area.scrollTop = area.scrollHeight;
        }, (error) => {
            console.error("Messages load error:", error);
            area.innerHTML = `<div class="loading-text">Error: ${error.message}</div>`;
        });
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    div.className = 'message ' + (msg.senderId === currentUser.uid ? 'sent' : 'received');

    let timeStr = "";
    if (msg.createdAt && msg.createdAt.toDate) {
        const d = msg.createdAt.toDate();
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    div.innerHTML = `${escapeHtml(msg.text)}<span class="time">${timeStr}</span>`;
    return div;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================================
// INITIALIZATION
// ==========================================================
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-email').innerText = user.email;
        applyLang('en');
    } else {
        window.location.href = "index.html";
    }
});
