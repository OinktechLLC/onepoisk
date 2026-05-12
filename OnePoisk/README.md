# OnePoisk — Поисковая система нового поколения

<div align="center">

![OnePoisk Logo](https://img.shields.io/badge/OnePoisk-найдётся_всё!-yellow?style=for-the-badge&logo=yandex)

**Современная поисковая система в стиле Яндекс (ya.ru)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/OnePoisk)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/OnePoisk)

</div>

## 🌟 Особенности

- 🔍 **Умный поиск** — интеграция с Wikipedia и DuckDuckGo
- 🎤 **Голосовой ввод** — как в Яндексе
- 📱 **Адаптивный дизайн** — работает на всех устройствах
- 🎨 **Стиль ya.ru** — один в один как у Яндекса
- 🔒 **Oink ID** — локальная система аккаунтов
- 🪙 **Монеты и подписка** — One Pro без рекламы
- 🔗 **Закладки** — сохраняйте найденное
- 🌐 **Геоблокировка** — только РФ и СНГ
- 🕵️ **Режим инкогнито** — приватный поиск
- 📺 **Реклама** — интегрирована как в Яндексе

## 🚀 Быстрый старт

### Локальный запуск

```bash
# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/OnePoisk.git

# Перейдите в директорию
cd OnePoisk

# Откройте index.html в браузере
# Или используйте локальный сервер:
npx serve .
```

### Развёртывание на Vercel

1. Зарегистрируйтесь на [Vercel](https://vercel.com)
2. Импортируйте репозиторий
3. Нажмите Deploy

Или используйте кнопку выше для автоматического развёртывания.

### Развёртывание на Netlify

1. Зарегистрируйтесь на [Netlify](https://netlify.com)
2. Перетащите папку с проектом или подключите Git
3. Сайт будет развёрнут автоматически

### Другие платформы

Проект можно развернуть на любой платформе для статических сайтов:
- GitHub Pages
- Cloudflare Pages
- Firebase Hosting
- Surge.sh

## 📁 Структура проекта

```
OnePoisk/
├── index.html          # Главная страница (стиль ya.ru)
├── styles.css          # Все стили
├── app.js              # Основная логика
├── SearchEngine.html   # Оригинальный поисковой движок
└── README.md           # Документация
```

## 🎯 Функционал

### Поисковая система

- Поиск через Wikipedia API
- Интеграция с DuckDuckGo Instant Answer
- Результаты открываются в модальном окне
- Кнопка "Мне повезёт!" (как у Google)

### Голосовой поиск

```javascript
// Работает в Chrome, Edge, Safari
const recognition = new SpeechRecognition();
recognition.lang = 'ru-RU';
```

### Oink ID

Локальная система аккаунтов с хранением в localStorage:

- Регистрация/Вход
- Загрузка аватара (сохраняется до очистки кеша)
- Никнеймы
- Монеты (ежедневная награда +10)
- Подписка One Pro (99 монет, 14 дней, без рекламы)

### Закладки

- Автоматическое сохранение открытых сервисов
- Ручное управление
- Хранение в localStorage

### Сервисы

По умолчанию включены:
- Почта, Карты, Маркет, Музыка
- Видео, Новости, Переводчик, Диск
- Телеграм, ВКонтакте, Одноклассники
- Афиша, Погода, Пробки

**Добавление новых сервисов:**

Откройте `app.js` и добавьте в массив `defaultServices`:

```javascript
{ 
    name: 'Название', 
    url: 'https://example.com', 
    icon: '🎯', 
    color: '#ff0000' 
}
```

### Геоблокировка

Доступ разрешён только из стран СНГ:
- 🇷🇺 Россия (RU)
- 🇧🇾 Беларусь (BY)
- 🇰🇿 Казахстан (KZ)
- 🇦🇲 Армения (AM)
- 🇦🇿 Азербайджан (AZ)
- 🇰🇬 Киргизия (KG)
- 🇲🇩 Молдова (MD)
- 🇹🇯 Таджикистан (TJ)
- 🇹🇲 Туркменистан (TM)
- 🇺🇿 Узбекистан (UZ)

### Рекламные блоки

Интегрирован рекламный скрипт:

```html
<div class="topAdPad">
    <div id="movie_video"></div>
    <script type="text/javascript" src="https://vak345.com/s.js?v=03208824bea369b060dba1f2083d6a4c" async></script>
</div>
```

Подписка One Pro отключает рекламу.

## 🎨 Дизайн

Дизайн полностью повторяет стиль ya.ru:

- Жёлто-оранжевая цветовая схема
- Минималистичный интерфейс
- Скруглённые элементы
- Плавные анимации
- Тёмная тема (через режим инкогнито)

## 🔧 Настройка

### Изменение логотипа

Откройте `index.html` и найдите SVG с классом `onepoisk-logo`.

### Добавление страниц

В `app.js` добавьте в объект `pagesContent`:

```javascript
newpage: {
    title: 'Название страницы',
    content: `<p>Контент страницы</p>`
}
```

### Изменение геоблокировки

В `app.js` измените массив `CIS_COUNTRIES`.

## 📊 Технологии

- **HTML5** — семантическая разметка
- **CSS3** — Flexbox, Grid, CSS Variables
- **JavaScript (ES6+)** — современный JS без фреймворков
- **LocalStorage** — хранение данных пользователя
- **Fetch API** — асинхронные запросы
- **Web Speech API** — голосовой ввод

## 🌐 Браузеры

Поддерживаемые браузеры:
- ✅ Chrome/Chromium (полная поддержка)
- ✅ Edge (полная поддержка)
- ✅ Safari (голосовой поиск ограничен)
- ⚠️ Firefox (голосовой поиск требует настройки)

## 📝 Лицензия

© 2025 OnePoisk. Сделано с любовью для Oink Tech Ltd Co.

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📞 Контакты

- Email: support@onepoisk.ru
- Сайт: https://onepoisk.ru (демо)

## ⚠️ Важные заметки

1. **Oink ID хранит данные локально** — при очистке кеша данные удаляются
2. **Геоблокировка работает через IP** — используется API ipapi.co
3. **Голосовой поиск** — требует HTTPS или localhost
4. **Реклама** — может не работать с блокировщиками
5. **Сервисы в iframe** — некоторые сайты могут блокировать отображение в iframe

---

<div align="center">

**OnePoisk — найдётся всё!** 🚀

Made with ❤️ by Oink Tech Ltd Co

</div>
