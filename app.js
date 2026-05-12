// OnePoisk Application
// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация приложения
    initGeoCheck();
    initServices();
    initSearch();
    initVoiceSearch();
    initModals();
    initOinkID();
    initBookmarks();
    initPages();
    initIncognitoMode();
});

// ============================================
// ГЕОБЛОКИРОВКА
// ============================================
const CIS_COUNTRIES = ['RU', 'BY', 'KZ', 'AM', 'AZ', 'KG', 'MD', 'TJ', 'TM', 'UZ', 'UA', 'EE', 'LV', 'LT', 'GE'];

async function initGeoCheck() {
    try {
        // Пробуем несколько сервисов для определения геолокации
        const services = [
            'https://ipapi.co/json/',
            'https://ipwhois.app/json/',
            'https://ip-api.com/json/'
        ];
        
        let countryCode = null;
        
        for (const service of services) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                countryCode = data.country_code || data.countryCode;
                if (countryCode) break;
            } catch (e) {
                console.warn(`Service ${service} failed:`, e);
                continue;
            }
        }
        
        // Если не удалось определить страну - показываем контент (не блокируем)
        if (!countryCode) {
            console.log('Не удалось определить страну, показываем контент');
            document.getElementById('geo-block').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
            return;
        }
        
        if (!CIS_COUNTRIES.includes(countryCode)) {
            document.getElementById('geo-block').classList.remove('hidden');
            document.getElementById('main-content').classList.add('hidden');
        } else {
            document.getElementById('geo-block').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Geo check error:', error);
        // При любой ошибке показываем контент, а не блокировку
        document.getElementById('geo-block').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
    }
}

// ============================================
// СЕРВИСЫ
// ============================================
const defaultServices = [
    { name: 'Почта', url: 'https://mail.ru', icon: '📧', color: '#005ff9' },
    { name: 'Карты', url: 'https://maps.yandex.ru', icon: '🗺️', color: '#f90' },
    { name: 'Маркет', url: 'https://market.yandex.ru', icon: '🛒', color: '#fc0' },
    { name: 'Музыка', url: 'https://music.yandex.ru', icon: '🎵', color: '#f44336' },
    { name: 'Видео', url: 'https://youtube.com', icon: '🎬', color: '#ff0000' },
    { name: 'Новости', url: 'https://news.yandex.ru', icon: '📰', color: '#2196f3' },
    { name: 'Переводчик', url: 'https://translate.yandex.ru', icon: '🌐', color: '#fc0' },
    { name: 'Диск', url: 'https://disk.yandex.ru', icon: '☁️', color: '#00bcd4' },
    { name: 'Телеграм', url: 'https://web.telegram.org', icon: '✈️', color: '#0088cc' },
    { name: 'ВКонтакте', url: 'https://vk.com', icon: '👥', color: '#0077ff' },
    { name: 'Одноклассники', url: 'https://ok.ru', icon: '🔶', color: '#ee8208' },
    { name: 'Афиша', url: 'https://afisha.yandex.ru', icon: '🎭', color: '#9c27b0' },
    { name: 'Погода', url: 'https://yandex.ru/pogoda', icon: '🌤️', color: '#2196f3' },
    { name: 'Пробки', url: 'https://yandex.ru/maps', icon: '🚦', color: '#4caf50' },
];

function generateServiceCover(service) {
    // Генерация актуальной обложки для сервиса
    const colors = ['#fc0', '#f90', '#f00', '#0066ff', '#4caf50', '#9c27b0', '#e91e63', '#00bcd4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return {
        background: `linear-gradient(135deg, ${randomColor}, ${service.color})`,
        icon: service.icon
    };
}

function initServices() {
    const servicesGrid = document.getElementById('services-grid');
    const savedServices = localStorage.getItem('onepoisk_services');
    const services = savedServices ? JSON.parse(savedServices) : defaultServices;
    
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const cover = generateServiceCover(service);
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-icon" style="background: ${cover.background}">
                ${cover.icon}
            </div>
            <div class="service-name">${service.name}</div>
        `;
        card.addEventListener('click', () => openServiceModal(service));
        servicesGrid.appendChild(card);
    });
}

function openServiceModal(service) {
    const modal = document.getElementById('service-modal');
    const title = document.getElementById('service-title');
    const frame = document.getElementById('service-frame');
    
    title.textContent = service.name;
    frame.src = service.url;
    
    modal.classList.remove('hidden');
    
    // Добавляем в закладки автоматически при открытии
    addToBookmarks(service.name, service.url, service.icon, service.color);
}

// ============================================
// ПОИСК
// ============================================
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-btn');
    const luckyBtn = document.getElementById('lucky-btn');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim()) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    });
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        clearBtn.classList.add('hidden');
    });
    
    luckyBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            window.open(`https://www.google.com/search?btnI=1&q=${encodeURIComponent(searchInput.value)}`, '_blank');
        }
    });
}

async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    
    const modal = document.getElementById('search-modal');
    const resultsDiv = document.getElementById('search-results');
    const wikiDiv = document.getElementById('wikipedia-result');
    
    modal.classList.remove('hidden');
    resultsDiv.innerHTML = '<p>Поиск...</p>';
    wikiDiv.innerHTML = '';
    
    try {
        // Поиск в Wikipedia
        await searchWikipedia(query, wikiDiv);
        
        // Поиск через Google Custom Search API (эмуляция)
        await performWebSearch(query, resultsDiv);
    } catch (error) {
        console.error('Search error:', error);
        resultsDiv.innerHTML = '<p>Произошла ошибка при поиске.</p>';
    }
}

async function searchWikipedia(query, container) {
    const url = `https://ru.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&titles=${encodeURIComponent(query)}&exintro=1&explaintext=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId !== '-1' && pages[pageId].extract) {
            const extract = pages[pageId].extract.substring(0, 500) + '...';
            container.innerHTML = `
                <h3>${pages[pageId].title}</h3>
                <p>${extract}</p>
                <a href="https://ru.wikipedia.org/wiki/${encodeURIComponent(pages[pageId].title)}" target="_blank" style="color: #0066ff;">Читать далее →</a>
            `;
        }
    } catch (error) {
        console.error('Wikipedia search error:', error);
    }
}

async function performWebSearch(query, container) {
    // Эмуляция поиска с использованием DuckDuckGo Instant API
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        let results = [];
        
        if (data.AbstractText) {
            results.push({
                title: data.Heading || 'Информация',
                snippet: data.AbstractText,
                url: data.AbstractURL || '#'
            });
        }
        
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            data.RelatedTopics.slice(0, 10).forEach(topic => {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.split(' - ')[0],
                        snippet: topic.Text,
                        url: topic.FirstURL
                    });
                }
            });
        }
        
        if (results.length === 0) {
            // Fallback: генерируем результаты на основе запроса
            results = generateFallbackResults(query);
        }
        
        displayResults(results, container);
    } catch (error) {
        console.error('Web search error:', error);
        const fallbackResults = generateFallbackResults(query);
        displayResults(fallbackResults, container);
    }
}

function generateFallbackResults(query) {
    return [
        {
            title: `${query} — Википедия`,
            snippet: `Статья о "${query}" в свободной энциклопедии Википедия. Подробная информация, история, факты и многое другое.`,
            url: `https://ru.wikipedia.org/wiki/${encodeURIComponent(query)}`
        },
        {
            title: `${query} — последние новости`,
            snippet: `Все последние новости по теме "${query}". Актуальная информация, события, мнения экспертов.`,
            url: `https://yandex.ru/news/search?text=${encodeURIComponent(query)}`
        },
        {
            title: `${query} — изображения`,
            snippet: `Поиск изображений по запросу "${query}". Фотографии, картинки, иллюстрации высокого качества.`,
            url: `https://yandex.ru/images/search?text=${encodeURIComponent(query)}`
        },
        {
            title: `${query} — видео`,
            snippet: `Видеоролики по теме "${query}". Смотрите онлайн бесплатно в хорошем качестве.`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        },
        {
            title: `${query} — купить`,
            snippet: `Товары и услуги по запросу "${query}". Сравнение цен, отзывы покупателей, доставка.`,
            url: `https://market.yandex.ru/search?text=${encodeURIComponent(query)}`
        }
    ];
}

function displayResults(results, container) {
    container.innerHTML = '';
    
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <a href="${result.url}" class="result-title" target="_blank">${result.title}</a>
            <p class="result-snippet">${result.snippet}</p>
        `;
        item.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                window.open(result.url, '_blank');
            }
        });
        container.appendChild(item);
    });
}

// ============================================
// ГОЛОСОВОЙ ПОИСК
// ============================================
function initVoiceSearch() {
    const voiceBtn = document.getElementById('voice-btn');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceBtn.style.display = 'none';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('listening')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    
    recognition.onstart = () => {
        voiceBtn.classList.add('listening');
    };
    
    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('search-input').value = transcript;
        document.getElementById('clear-btn').classList.remove('hidden');
        performSearch();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceBtn.classList.remove('listening');
    };
}

// ============================================
// МОДАЛЬНЫЕ ОКНА
// ============================================
function initModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeAllModals();
        });
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    
    // Очистка iframe при закрытии
    const frame = document.getElementById('service-frame');
    if (frame) frame.src = '';
}

function openModal(modalId) {
    closeAllModals();
    document.getElementById(modalId).classList.remove('hidden');
}

// ============================================
// OINK ID
// ============================================
let currentUser = null;

function initOinkID() {
    loadCurrentUser();
    
    document.getElementById('login-btn').addEventListener('click', () => {
        openModal('oink-modal');
    });
    
    document.getElementById('oink-login-submit').addEventListener('click', handleLogin);
    document.getElementById('oink-logout').addEventListener('click', handleLogout);
    document.getElementById('avatar-upload').addEventListener('change', handleAvatarUpload);
    document.getElementById('nickname-save').addEventListener('click', handleNicknameSave);
    document.getElementById('buy-subscription').addEventListener('click', buySubscription);
    document.getElementById('daily-claim').addEventListener('click', claimDailyReward);
    
    // Клик по профилю открывает модальное окно
    document.getElementById('oink-profile').addEventListener('click', () => {
        openModal('oink-modal');
    });
}

function loadCurrentUser() {
    const saved = localStorage.getItem('oink_current_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateProfileUI();
    }
}

function handleLogin() {
    const username = document.getElementById('oink-username').value.trim();
    const password = document.getElementById('oink-password').value.trim();
    
    if (!username || !password) {
        alert('Введите никнейм и пароль');
        return;
    }
    
    // Получаем существующих пользователей или создаём нового
    const users = JSON.parse(localStorage.getItem('oink_users') || '{}');
    
    if (!users[username]) {
        // Регистрация нового пользователя
        users[username] = {
            password: password,
            coins: 100, // Стартовый бонус
            avatar: null,
            subscription: null,
            lastDailyClaim: null,
            createdAt: new Date().toISOString()
        };
    } else {
        // Проверка пароля
        if (users[username].password !== password) {
            alert('Неверный пароль');
            return;
        }
    }
    
    localStorage.setItem('oink_users', JSON.stringify(users));
    localStorage.setItem('oink_current_user', username);
    
    currentUser = username;
    updateProfileUI();
    
    document.getElementById('oink-login-form').classList.add('hidden');
    document.getElementById('oink-profile-panel').classList.remove('hidden');
    
    showProfileData();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('oink_current_user');
    updateProfileUI();
    
    document.getElementById('oink-profile-panel').classList.add('hidden');
    document.getElementById('oink-login-form').classList.remove('hidden');
    
    document.getElementById('oink-username').value = '';
    document.getElementById('oink-password').value = '';
}

function updateProfileUI() {
    const authDiv = document.getElementById('oink-auth');
    const profileDiv = document.getElementById('oink-profile');
    
    if (currentUser) {
        authDiv.classList.add('hidden');
        profileDiv.classList.remove('hidden');
        showProfileData();
    } else {
        authDiv.classList.remove('hidden');
        profileDiv.classList.add('hidden');
    }
}

function showProfileData() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('oink_users') || '{}');
    const user = users[currentUser];
    
    if (!user) return;
    
    document.getElementById('profile-nickname').textContent = currentUser;
    document.getElementById('profile-coins').textContent = `🪙 ${user.coins}`;
    
    if (user.avatar) {
        document.getElementById('profile-avatar').src = user.avatar;
        document.getElementById('oink-avatar-display').src = user.avatar;
    }
    
    document.getElementById('oink-nickname-display').textContent = currentUser;
    document.getElementById('oink-coins-display').textContent = `🪙 ${user.coins} монет`;
    
    // Подписка
    const subStatus = document.getElementById('sub-status');
    if (user.subscription && new Date(user.subscription.endDate) > new Date()) {
        subStatus.textContent = `One Pro активна до ${new Date(user.subscription.endDate).toLocaleDateString()}`;
        document.body.classList.add('one-pro-active');
    } else {
        subStatus.textContent = 'Статус: Нет активной подписки';
        document.body.classList.remove('one-pro-active');
    }
    
    // Ежедневная награда
    const dailyBtn = document.getElementById('daily-claim');
    const today = new Date().toDateString();
    if (user.lastDailyClaim === today) {
        dailyBtn.disabled = true;
        dailyBtn.textContent = 'Уже получено сегодня';
    } else {
        dailyBtn.disabled = false;
        dailyBtn.textContent = 'Забрать ежедневную награду (+10 монет)';
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const avatarData = e.target.result;
        const users = JSON.parse(localStorage.getItem('oink_users') || '{}');
        users[currentUser].avatar = avatarData;
        localStorage.setItem('oink_users', JSON.stringify(users));
        
        document.getElementById('oink-avatar-display').src = avatarData;
        document.getElementById('profile-avatar').src = avatarData;
    };
    reader.readAsDataURL(file);
}

function handleNicknameSave() {
    alert('Смена никнейма будет доступна в следующей версии!');
}

function buySubscription() {
    const users = JSON.parse(localStorage.getItem('oink_users') || '{}');
    const user = users[currentUser];
    
    if (user.coins < 99) {
        alert('Недостаточно монет! Нужно 99 монет.');
        return;
    }
    
    if (!confirm('Купить One Pro подписку на 14 дней за 99 монет?')) return;
    
    user.coins -= 99;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    
    user.subscription = {
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString()
    };
    
    localStorage.setItem('oink_users', JSON.stringify(users));
    showProfileData();
    
    alert('Подписка One Pro активирована! Реклама отключена на 14 дней.');
}

function claimDailyReward() {
    const users = JSON.parse(localStorage.getItem('oink_users') || '{}');
    const user = users[currentUser];
    
    const today = new Date().toDateString();
    if (user.lastDailyClaim === today) {
        alert('Вы уже получили награду сегодня!');
        return;
    }
    
    user.coins += 10;
    user.lastDailyClaim = today;
    
    localStorage.setItem('oink_users', JSON.stringify(users));
    showProfileData();
    
    alert('Поздравляем! Вы получили 10 монет!');
}

// ============================================
// ЗАКЛАДКИ
// ============================================
function initBookmarks() {
    document.querySelector('[data-page="bookmarks"]').addEventListener('click', (e) => {
        e.preventDefault();
        showBookmarks();
    });
}

function addToBookmarks(name, url, icon, color) {
    const bookmarks = JSON.parse(localStorage.getItem('onepoisk_bookmarks') || '[]');
    
    // Проверяем, есть ли уже такая закладка
    const exists = bookmarks.some(b => b.url === url);
    if (exists) return;
    
    bookmarks.push({ name, url, icon, color, addedAt: new Date().toISOString() });
    localStorage.setItem('onepoisk_bookmarks', JSON.stringify(bookmarks));
}

function showBookmarks() {
    const modal = document.getElementById('bookmarks-modal');
    const list = document.getElementById('bookmarks-list');
    const bookmarks = JSON.parse(localStorage.getItem('onepoisk_bookmarks') || '[]');
    
    if (bookmarks.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666;">Закладок пока нет</p>';
    } else {
        list.innerHTML = '';
        bookmarks.forEach((bookmark, index) => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            item.innerHTML = `
                <div class="bookmark-icon" style="background: ${bookmark.color}">
                    ${bookmark.icon}
                </div>
                <div class="bookmark-info">
                    <div class="bookmark-title">${bookmark.name}</div>
                    <div class="bookmark-url">${bookmark.url}</div>
                </div>
                <button class="bookmark-delete" data-index="${index}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            `;
            
            item.querySelector('.bookmark-info').addEventListener('click', () => {
                window.open(bookmark.url, '_blank');
            });
            
            item.querySelector('.bookmark-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteBookmark(index);
            });
            
            list.appendChild(item);
        });
    }
    
    modal.classList.remove('hidden');
}

function deleteBookmark(index) {
    const bookmarks = JSON.parse(localStorage.getItem('onepoisk_bookmarks') || '[]');
    bookmarks.splice(index, 1);
    localStorage.setItem('onepoisk_bookmarks', JSON.stringify(bookmarks));
    showBookmarks();
}

// ============================================
// СТРАНИЦЫ (FAQ, Policy, Terms, Docs)
// ============================================
const pagesContent = {
    faq: {
        title: 'Часто задаваемые вопросы (FAQ)',
        content: `
            <h2>Что такое OnePoisk?</h2>
            <p>OnePoisk — это современная поисковая система с уникальным интерфейсом, вдохновлённым Яндексом.</p>
            
            <h2>Как пользоваться поиском?</h2>
            <p>Введите запрос в поисковую строку и нажмите "Найти" или Enter. Результаты откроются в модальном окне.</p>
            
            <h2>Что такое Oink ID?</h2>
            <p>Oink ID — это ваша учётная запись в OnePoisk. Она позволяет сохранять закладки, зарабатывать монеты и покупать подписку One Pro.</p>
            
            <h2>Как заработать монеты?</h2>
            <p>Заходите каждый день и забирайте ежедневную награду (+10 монет).</p>
            
            <h2>Что даёт подписка One Pro?</h2>
            <p>Подписка отключает рекламу на 14 дней и даёт улучшенный профиль.</p>
            
            <h2>Почему сервис недоступен в моей стране?</h2>
            <p>OnePoisk доступен только для пользователей из РФ и стран СНГ.</p>
        `
    },
    policy: {
        title: 'Политика конфиденциальности',
        content: `
            <h2>1. Общие положения</h2>
            <p>Настоящая политика конфиденциальности описывает, как OnePoisk собирает и использует вашу информацию.</p>
            
            <h2>2. Сбор данных</h2>
            <p>Мы собираем следующие данные:</p>
            <ul>
                <li>Поисковые запросы</li>
                <li>Данные профиля Oink ID (никнейм, аватар)</li>
                <li>Закладки</li>
            </ul>
            
            <h2>3. Хранение данных</h2>
            <p>Все данные хранятся локально в вашем браузере (localStorage).</p>
            
            <h2>4. Защита данных</h2>
            <p>Мы не передаём ваши данные третьим лицам.</p>
            
            <h2>5. Cookies</h2>
            <p>Сайт использует localStorage для сохранения настроек и данных пользователя.</p>
        `
    },
    terms: {
        title: 'Условия использования',
        content: `
            <h2>1. Принятие условий</h2>
            <p>Используя OnePoisk, вы соглашаетесь с настоящими условиями.</p>
            
            <h2>2. Правила использования</h2>
            <p>Запрещается:</p>
            <ul>
                <li>Использовать поиск для незаконных целей</li>
                <li>Пытаться взломать систему</li>
                <li>Распространять вредоносный контент</li>
            </ul>
            
            <h2>3. Интеллектуальная собственность</h2>
            <p>Все права на OnePoisk принадлежат Oink Tech Ltd Co.</p>
            
            <h2>4. Ограничение ответственности</h2>
            <p>OnePoisk не несёт ответственности за содержимое найденных сайтов.</p>
            
            <h2>5. Изменение условий</h2>
            <p>Мы оставляем за собой право изменять условия в любое время.</p>
        `
    },
    docs: {
        title: 'Документация',
        content: `
            <h2>API Поиска</h2>
            <p>OnePoisk использует следующие API:</p>
            <ul>
                <li>Wikipedia API — для получения энциклопедической информации</li>
                <li>DuckDuckGo Instant Answer API — для веб-поиска</li>
            </ul>
            
            <h2>Добавление сервисов</h2>
            <p>Сервисы добавляются через код в массиве defaultServices в файле app.js.</p>
            
            <h2>Структура проекта</h2>
            <ul>
                <li>index.html — главная страница</li>
                <li>styles.css — стили</li>
                <li>app.js — основная логика</li>
                <li>SearchEngine.html — оригинальный поисковой движок</li>
            </ul>
            
            <h2>Развёртывание</h2>
            <p>Проект можно развернуть на Vercel, Netlify или любом статическом хостинге.</p>
        `
    },
    about: {
        title: 'О компании',
        content: `
            <h2>OnePoisk</h2>
            <p>Современная поисковая система нового поколения.</p>
            
            <h2>Миссия</h2>
            <p>Предоставить пользователям удобный и быстрый поиск с минималистичным интерфейсом.</p>
            
            <h2>Команда</h2>
            <p>OnePoisk разработан компанией Oink Tech Ltd Co.</p>
            
            <h2>Контакты</h2>
            <p>Email: support@onepoisk.ru</p>
            
            <h2>Год основания</h2>
            <p>2025</p>
        `
    }
};

function initPages() {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.getAttribute('data-page');
            if (pageName !== 'bookmarks' && pagesContent[pageName]) {
                openPage(pageName);
            }
        });
    });
}

function openPage(pageName) {
    const page = pagesContent[pageName];
    if (!page) return;
    
    document.getElementById('page-title').textContent = page.title;
    document.getElementById('page-content').innerHTML = page.content;
    
    openModal('page-modal');
}

// ============================================
// РЕЖИМ ИНКОГНИТО
// ============================================
function initIncognitoMode() {
    const incognitoBtn = document.getElementById('incognito-btn');
    
    incognitoBtn.addEventListener('click', () => {
        document.body.classList.toggle('incognito-mode');
        incognitoBtn.classList.toggle('active');
        
        if (document.body.classList.contains('incognito-mode')) {
            // Сохраняем состояние в sessionStorage (очищается при закрытии вкладки)
            sessionStorage.setItem('incognito', 'true');
        } else {
            sessionStorage.removeItem('incognito');
        }
    });
    
    // Восстанавливаем режим при перезагрузке (если вкладка ещё открыта)
    if (sessionStorage.getItem('incognito') === 'true') {
        document.body.classList.add('incognito-mode');
        incognitoBtn.classList.add('active');
    }
}

// ============================================
// УТИЛИТЫ
// ============================================
window.openModal = openModal;
window.closeAllModals = closeAllModals;
window.addToBookmarks = addToBookmarks;

// ============================================
// ЖИВЫЕ ОБОИ И ПОГОДА
// ============================================
function initLiveWallpaper() {
    const wallpaper = document.getElementById('liveWallpaper');
    if (!wallpaper) return;
    
    // Анимация градиента уже в CSS
    // Можно добавить интерактивность с мышью
    wallpaper.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        wallpaper.style.background = `linear-gradient(${135 + x * 45}deg, #667eea 0%, #764ba2 ${50 + y * 20}%, #f093fb 100%)`;
    });
}

// ============================================
// ВИДЖЕТ ПОГОДЫ
// ============================================
async function initWeatherWidget() {
    const widget = document.getElementById('weatherWidget');
    if (!widget) return;
    
    const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    try {
        // Используем открытый API погоды (Open-Meteo - бесплатный, не требует ключа)
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(randomCity)}&count=1&language=ru&format=json`);
        const geoData = await geoResponse.json();
        
        if (geoData.results && geoData.results[0]) {
            const { latitude, longitude, name } = geoData.results[0];
            
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherResponse.json();
            
            if (weatherData.current_weather) {
                const temp = Math.round(weatherData.current_weather.temperature);
                const windSpeed = weatherData.current_weather.windspeed;
                
                widget.querySelector('.weather-temp').textContent = `${temp > 0 ? '+' : ''}${temp}°`;
                widget.querySelector('.weather-city').textContent = name;
                
                // Определение описания погоды
                const weatherCode = weatherData.current_weather.weathercode;
                const descriptions = {
                    0: 'Ясно ☀️',
                    1: 'Преимущественно ясно 🌤️',
                    2: 'Облачно ⛅',
                    3: 'Пасмурно ☁️',
                    45: 'Туман 🌫️',
                    48: 'Иней 🌨️',
                    51: 'Морось 💧',
                    53: 'Морось 💧',
                    55: 'Морось 💧',
                    61: 'Дождь 🌧️',
                    63: 'Дождь 🌧️',
                    65: 'Сильный дождь ⛈️',
                    71: 'Снег ❄️',
                    73: 'Снег ❄️',
                    75: 'Снегопад 🌨️',
                    80: 'Ливень ☔',
                    81: 'Ливень ☔',
                    82: 'Сильный ливень ⛈️',
                    95: 'Гроза ⚡',
                    96: 'Гроза с градом ⛈️',
                    99: 'Гроза с градом ⛈️'
                };
                
                widget.querySelector('.weather-desc').textContent = descriptions[weatherCode] || 'Неизвестно';
            }
        }
    } catch (error) {
        console.error('Weather error:', error);
        widget.querySelector('.weather-temp').textContent = '--°';
        widget.querySelector('.weather-desc').textContent = 'Нет данных';
        widget.querySelector('.weather-city').textContent = randomCity;
    }
}

// ============================================
// ЛЕНТА РЕКОМЕНДАЦИЙ (ДЗЕН)
// ============================================
function initZenFeed() {
    const container = document.getElementById('feedContainer');
    if (!container) return;
    
    const newsTopics = [
        { title: 'Технологии будущего: что нас ждёт в 2025 году', source: 'TechNews', color: '#667eea' },
        { title: 'Новые возможности искусственного интеллекта', source: 'AI World', color: '#764ba2' },
        { title: 'Космические исследования: последние открытия', source: 'Space Daily', color: '#f093fb' },
        { title: 'Экология и устойчивое развитие', source: 'Green Planet', color: '#4CAF50' },
        { title: 'Спорт: главные события недели', source: 'Sport Express', color: '#f44336' },
        { title: 'Культура и искусство: новые выставки', source: 'Art Review', color: '#ff9800' },
        { title: 'Экономика: прогнозы экспертов', source: 'Finance Today', color: '#2196f3' },
        { title: 'Путешествия: топ направлений этого сезона', source: 'Travel Guide', color: '#00bcd4' }
    ];
    
    const fragment = document.createDocumentFragment();
    
    newsTopics.forEach((news, index) => {
        const card = document.createElement('div');
        card.className = 'feed-card';
        card.onclick = () => {
            showNotification(`Открываем: ${news.title}`, 'success');
        };
        
        const gradient = `linear-gradient(135deg, ${news.color} 0%, ${news.color}dd 100%)`;
        
        card.innerHTML = `
            <div class="feed-image" style="background: ${gradient}"></div>
            <div class="feed-content">
                <div class="feed-source">${news.source}</div>
                <div class="feed-headline">${news.title}</div>
                <div class="feed-time">${index * 15 + 5} минут назад</div>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

// ============================================
// БЫСТРЫЕ ССЫЛКИ
// ============================================
function initQuickLinks() {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (!searchWrapper) return;
    
    const quickLinksDiv = document.createElement('div');
    quickLinksDiv.className = 'quick-links';
    
    const links = [
        { text: '🔥 Тренды', query: 'популярные запросы сегодня' },
        { text: '📺 ТВ онлайн', query: 'смотреть телевизор онлайн бесплатно' },
        { text: '🎵 Музыка', query: 'слушать музыку онлайн' },
        { text: '🎬 Кино', query: 'смотреть фильмы онлайн бесплатно' },
        { text: '💰 Курс валют', query: 'курс доллара и евро сегодня' }
    ];
    
    links.forEach(link => {
        const span = document.createElement('span');
        span.className = 'quick-link';
        span.textContent = link.text;
        span.onclick = () => {
            document.getElementById('search-input').value = link.query;
            performSearch(link.query);
        };
        quickLinksDiv.appendChild(span);
    });
    
    searchWrapper.appendChild(quickLinksDiv);
}

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ЯНДЕКС БРАУЗЕРА
// ============================================

// Алиса (голосовой помощник) - улучшенная версия
function initAliceAssistant() {
    const voiceBtn = document.getElementById('voice-btn');
    if (!voiceBtn) return;
    
    let isListening = false;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'ru-RU';
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
            isListening = true;
            voiceBtn.style.background = '#fc0';
            voiceBtn.style.animation = 'pulse 0.5s infinite';
            showNotification('Слушаю вас...', 'info');
        };
        
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            document.getElementById('search-input').value = transcript;
            
            if (event.results[0].isFinal) {
                performSearch(transcript);
            }
        };
        
        recognition.onerror = (event) => {
            isListening = false;
            voiceBtn.style.background = '';
            voiceBtn.style.animation = '';
            showNotification('Ошибка распознавания речи', 'error');
        };
        
        recognition.onend = () => {
            isListening = false;
            voiceBtn.style.background = '';
            voiceBtn.style.animation = '';
        };
        
        voiceBtn.onclick = () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        };
    } else {
        voiceBtn.style.display = 'none';
        showNotification('Голосовой ввод не поддерживается вашим браузером', 'warning');
    }
}

// Турбо-режим (ускорение загрузки)
function initTurboMode() {
    // Сохраняем предпочтение турбо-режима
    const turboEnabled = localStorage.getItem('onepoisk_turbo') === 'true';
    
    if (turboEnabled) {
        document.body.classList.add('turbo-mode');
        showNotification('Турбо-режим включён', 'success');
    }
}

// Синхронизация Oink ID между вкладками
function initOinkSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'oink_user') {
            location.reload(); // Перезагружаем при изменении профиля в другой вкладке
        }
        if (e.key === 'oink_coins') {
            updateCoinDisplay();
        }
    });
}

// Статистика поиска
function initSearchStats() {
    const stats = JSON.parse(localStorage.getItem('onepoisk_stats') || '{"searches": 0, "bookmarks": 0}');
    console.log('OnePoisk Stats:', stats);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация приложения
    initGeoCheck();
    initServices();
    initSearch();
    initVoiceSearch();
    initModals();
    initOinkID();
    initBookmarks();
    initPages();
    initIncognitoMode();
    
    // Новые функции
    initLiveWallpaper();
    initWeatherWidget();
    initZenFeed();
    initQuickLinks();
    initAliceAssistant();
    initTurboMode();
    initOinkSync();
    initSearchStats();
});
