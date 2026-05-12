// Services Configuration - Add new services here
const services = [
    {
        id: 'mail',
        name: 'Почта',
        icon: '📧',
        url: 'https://mail.google.com'
    },
    {
        id: 'maps',
        name: 'Карты',
        icon: '🗺️',
        url: 'https://maps.google.com'
    },
    {
        id: 'market',
        name: 'Маркет',
        icon: '🛒',
        url: 'https://market.yandex.ru'
    },
    {
        id: 'music',
        name: 'Музыка',
        icon: '🎵',
        url: 'https://music.yandex.ru'
    },
    {
        id: 'video',
        name: 'Видео',
        icon: '🎬',
        url: 'https://youtube.com'
    },
    {
        id: 'news',
        name: 'Новости',
        icon: '📰',
        url: 'https://news.yandex.ru'
    },
    {
        id: 'translate',
        name: 'Переводчик',
        icon: '🌐',
        url: 'https://translate.yandex.ru'
    },
    {
        id: 'disk',
        name: 'Диск',
        icon: '☁️',
        url: 'https://disk.yandex.ru'
    },
    {
        id: 'weather',
        name: 'Погода',
        icon: '🌤️',
        url: 'https://yandex.ru/pogoda'
    },
    {
        id: 'images',
        name: 'Картинки',
        icon: '🖼️',
        url: 'https://yandex.ru/images'
    }
];

// Allowed countries (RF and CIS members)
const allowedCountries = [
    'RU', // Russia
    'BY', // Belarus
    'KZ', // Kazakhstan
    'KG', // Kyrgyzstan
    'TJ', // Tajikistan
    'AM', // Armenia
    'AZ', // Azerbaijan
    'MD', // Moldova
    'UZ', // Uzbekistan
    'TM', // Turkmenistan
    'GE', // Georgia
    'UA'  // Ukraine (still in some CIS agreements)
];

// DOM Elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const voiceBtn = document.getElementById('voiceBtn');
const voiceSearchBtn = document.getElementById('voiceSearchBtn');
const oinkIdBtn = document.getElementById('oinkIdBtn');
const incognitoBtn = document.getElementById('incognitoBtn');
const websiteModal = document.getElementById('websiteModal');
const modalTitle = document.getElementById('modalTitle');
const modalIframe = document.getElementById('modalIframe');
const modalClose = document.getElementById('modalClose');
const oinkModal = document.getElementById('oinkModal');
const oinkModalClose = document.getElementById('oinkModalClose');
const bookmarksModal = document.getElementById('bookmarksModal');
const bookmarksModalClose = document.getElementById('bookmarksModalClose');
const servicesGrid = document.getElementById('servicesGrid');
const headerAvatar = document.getElementById('headerAvatar');
const headerUsername = document.getElementById('headerUsername');
const profileAvatar = document.getElementById('profileAvatar');
const nicknameInput = document.getElementById('nicknameInput');
const coinsCount = document.getElementById('coinsCount');
const buyProBtn = document.getElementById('buyProBtn');
const dailyBonusBtn = document.getElementById('dailyBonusBtn');
const avatarUpload = document.getElementById('avatarUpload');
const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
const bookmarksList = document.getElementById('bookmarksList');

// State
let isIncognito = false;
let recognition = null;
let user_data = {
    coins: 0,
    lastBonus: null,
    hasPro: false,
    proExpiry: null,
    avatar: null,
    nickname: '',
    bookmarks: []
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkCountry();
    loadServices();
    loadUserData();
    setupEventListeners();
    updateUI();
});

// Country Check
function checkCountry() {
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const countryCode = data.country_code;
            if (!allowedCountries.includes(countryCode)) {
                showAccessDenied();
            }
        })
        .catch(() => {
            // If can't determine country, allow access
        });
}

function showAccessDenied() {
    document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; flex-direction: column; text-align: center; padding: 24px;">
            <h1 style="color: #f00; font-size: 32px; margin-bottom: 16px;">Доступ запрещён</h1>
            <p style="color: #333; font-size: 18px; max-width: 600px;">
                Извините, доступ к OnePoisk доступен только для пользователей из РФ и стран участников СНГ.
            </p>
        </div>
    `;
}

// Load Services
function loadServices() {
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" data-url="${service.url}" data-name="${service.name}">
            <div class="service-icon">${service.icon}</div>
            <div class="service-name">${service.name}</div>
        </div>
    `).join('');

    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            openWebsite(card.dataset.url, card.dataset.name);
        });
    });
}

// Event Listeners
function setupEventListeners() {
    searchForm.addEventListener('submit', handleSearch);
    voiceBtn.addEventListener('click', startVoiceSearch);
    voiceSearchBtn.addEventListener('click', startVoiceSearch);
    oinkIdBtn.addEventListener('click', openOinkModal);
    incognitoBtn.addEventListener('click', toggleIncognito);
    modalClose.addEventListener('click', closeWebsiteModal);
    oinkModalClose.addEventListener('click', closeOinkModal);
    bookmarksModalClose.addEventListener('click', closeBookmarksModal);
    buyProBtn.addEventListener('click', buyPro);
    dailyBonusBtn.addEventListener('click', claimDailyBonus);
    uploadAvatarBtn.addEventListener('click', () => avatarUpload.click());
    avatarUpload.addEventListener('change', handleAvatarUpload);
    nicknameInput.addEventListener('input', handleNicknameChange);

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });
}

// Search Handler
function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        const searchUrl = `https://yandex.ru/search/?text=${encodeURIComponent(query)}`;
        openWebsite(searchUrl, `Поиск: ${query}`);
    }
}

// Voice Search
function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Голосовой ввод не поддерживается вашим браузером');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        voiceSearchBtn.classList.add('recording');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        handleSearch(new Event('submit'));
    };

    recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        voiceSearchBtn.classList.remove('recording');
    };

    recognition.onend = () => {
        voiceSearchBtn.classList.remove('recording');
    };

    recognition.start();
}

// Open Website in Modal
function openWebsite(url, title) {
    if (isIncognito) {
        // In incognito mode, don't save to history
    }
    
    modalTitle.textContent = title;
    modalIframe.src = url;
    websiteModal.classList.add('active');
}

function closeWebsiteModal() {
    websiteModal.classList.remove('active');
    modalIframe.src = '';
}

// Oink ID Functions
function openOinkModal() {
    oinkModal.classList.add('active');
}

function closeOinkModal() {
    oinkModal.classList.remove('active');
}

function closeAllModals() {
    closeWebsiteModal();
    closeOinkModal();
    closeBookmarksModal();
}

// Toggle Incognito Mode
function toggleIncognito() {
    isIncognito = !isIncognito;
    document.body.classList.toggle('incognito-mode', isIncognito);
    localStorage.setItem('onepoisk_incognito', isIncognito);
}

// User Data Management
function loadUserData() {
    const saved = localStorage.getItem('onepoisk_user');
    if (saved) {
        user_data = JSON.parse(saved);
    }
    
    const incognito = localStorage.getItem('onepoisk_incognito');
    if (incognito === 'true') {
        isIncognito = true;
        document.body.classList.add('incognito-mode');
    }
}

function saveUserData() {
    if (isIncognito) {
        // Don't save in incognito mode
        return;
    }
    localStorage.setItem('onepoisk_user', JSON.stringify(user_data));
}

function updateUI() {
    if (user_data.avatar) {
        headerAvatar.src = user_data.avatar;
        profileAvatar.src = user_data.avatar;
    }
    
    if (user_data.nickname) {
        headerUsername.textContent = user_data.nickname;
        nicknameInput.value = user_data.nickname;
    }
    
    coinsCount.textContent = user_data.coins;
    
    // Check Pro status
    if (user_data.hasPro && user_data.proExpiry) {
        const expiry = new Date(user_data.proExpiry);
        if (new Date() > expiry) {
            user_data.hasPro = false;
            user_data.proExpiry = null;
            saveUserData();
        }
    }
    
    updateBookmarksList();
}

// Avatar Upload
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            user_data.avatar = event.target.result;
            saveUserData();
            updateUI();
        };
        reader.readAsDataURL(file);
    }
}

// Nickname Change
function handleNicknameChange(e) {
    user_data.nickname = e.target.value.trim();
    saveUserData();
    updateUI();
}

// Daily Bonus
function claimDailyBonus() {
    const today = new Date().toDateString();
    
    if (user_data.lastBonus === today) {
        alert('Вы уже забрали бонус сегодня!');
        return;
    }
    
    user_data.coins += 10;
    user_data.lastBonus = today;
    saveUserData();
    updateUI();
    
    alert('+10 монет! Заходите каждый день для получения бонусов.');
}

// Buy Pro
function buyPro() {
    if (user_data.coins < 100) {
        alert('Недостаточно монет! Нужно 100 монет.');
        return;
    }
    
    if (user_data.hasPro) {
        alert('У вас уже есть активная подписка One Pro!');
        return;
    }
    
    user_data.coins -= 100;
    user_data.hasPro = true;
    user_data.proExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    saveUserData();
    updateUI();
    
    alert('Подписка One Pro активирована на 14 дней! Реклама отключена.');
    
    // Hide ads
    if (user_data.hasPro) {
        document.querySelectorAll('.topAdPad, .content-ad').forEach(ad => {
            ad.style.display = 'none';
        });
    }
}

// Bookmarks
function addBookmark(title, url) {
    if (isIncognito) return;
    
    const bookmark = {
        id: Date.now(),
        title,
        url,
        date: new Date().toISOString()
    };
    
    user_data.bookmarks.push(bookmark);
    saveUserData();
    updateBookmarksList();
}

function removeBookmark(id) {
    user_data.bookmarks = user_data.bookmarks.filter(b => b.id !== id);
    saveUserData();
    updateBookmarksList();
}

function updateBookmarksList() {
    if (user_data.bookmarks.length === 0) {
        bookmarksList.innerHTML = '<p style="text-align: center; color: #999;">Закладок пока нет</p>';
        return;
    }
    
    bookmarksList.innerHTML = user_data.bookmarks.map(bookmark => `
        <div class="bookmark-item" onclick="openWebsite('${bookmark.url}', '${bookmark.title}')">
            <span class="bookmark-title">${bookmark.title}</span>
            <button class="bookmark-delete" onclick="event.stopPropagation(); removeBookmark(${bookmark.id})">&times;</button>
        </div>
    `).join('');
}

function openBookmarksModal() {
    bookmarksModal.classList.add('active');
}

function closeBookmarksModal() {
    bookmarksModal.classList.remove('active');
}

// Make functions globally available
window.openWebsite = openWebsite;
window.removeBookmark = removeBookmark;
window.openBookmarksModal = openBookmarksModal;

// Add bookmark button to search results (example)
function addBookmarkButton() {
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.textContent = '🔖 В закладки';
    bookmarkBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #fc0; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; z-index: 999;';
    bookmarkBtn.onclick = () => {
        if (modalIframe.src) {
            addBookmark(modalTitle.textContent, modalIframe.src);
            alert('Добавлено в закладки!');
        }
    };
    document.body.appendChild(bookmarkBtn);
}

// Initialize bookmark button
setTimeout(addBookmarkButton, 1000);
