# Vilak.tv — Универсальный видеобалансер

**Сделано с ❤ для KinoplayerTop**

Vilak.tv — легальный универсальный видеобалансер. Поисковой робот автоматически ищет фильмы и сериалы по ID Кинопоиска на YouTube, Rutube, VK Video, OK Video и других легальных платформах.

---

## Структура проекта

```
vilak/
├── index.html          # Плеер (основная страница)
├── landing.html        # Лендинг (главная страница vilak.tv)
├── vilak.js            # Движок поискового робота и плеера
├── vilak-embed.js      # Embed SDK для сторонних сайтов
└── docs/
    ├── terms.html      # Условия использования
    ├── privacy.html    # Политика конфиденциальности
    ├── embed.html      # Документация по встраиванию
    └── api.html        # API документация
```

---

## Быстрый старт

### Открыть фильм по ID
```
vilak.tv/301
vilak.tv/77044?type=serial&s=1&e=1
```

### Встроить на сайт (script)
```html
<div id="player"></div>
<script src="https://vilak.tv/vilak-embed.js"></script>
<script>
  Vilak('#player', { kpId: 301 });
</script>
```

### Встроить через iframe
```html
<iframe
  src="https://vilak.tv/301"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
></iframe>
```

---

## Деплой

1. Разместите все файлы на веб-сервере под доменом `vilak.tv`
2. Настройте URL rewrite: все запросы вида `/12345` → `index.html`
3. В `index.html` JS автоматически читает ID из `location.pathname`

### Nginx config пример
```nginx
server {
    listen 80;
    server_name vilak.tv www.vilak.tv;
    root /var/www/vilak;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Docs
    location /docs/ {
        try_files $uri $uri.html =404;
    }
}
```

---

## Легальность

Vilak.tv **не пиратит контент**:
- Все видео берутся с официальных платформ через их embed API
- YouTube, Rutube, VK Video, OK Video — официальные публичные API
- Vilak.tv не хранит видео на своих серверах
- Поисковой робот работает с публичными API платформ

---

## Интеграция с KinoplayerTop

Добавьте источник в конфигурацию KinoplayerTop:
```javascript
{
  name: 'Vilak.tv',
  url: (kpId) => `https://vilak.tv/${kpId}`,
}
```

---

© 2025 Vilak.tv · Сделано с ❤ для KinoplayerTop
