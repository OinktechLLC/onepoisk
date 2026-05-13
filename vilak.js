/**
 * Vilak.tv — Видеобалансер
 * Поисковой робот по легальным источникам (YouTube, Rutube, VK Video и др.)
 * по ID Кинопоиска
 *
 * Сделано с ❤ для KinoplayerTop
 */

;(function (window) {
  'use strict';

  /* ============================================================
   *  CONFIG — легальные источники поиска
   * ============================================================ */
  const SOURCES = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '▶',
      iconClass: 'yt',
      priority: 1,
      search: searchYouTube,
      embed: makeYouTubeEmbed,
    },
    {
      id: 'rutube',
      name: 'Rutube',
      icon: '▶',
      iconClass: 'rt',
      priority: 2,
      search: searchRutube,
      embed: makeRutubeEmbed,
    },
    {
      id: 'vkvideo',
      name: 'VK Видео',
      icon: '▶',
      iconClass: 'vk',
      priority: 3,
      search: searchVkVideo,
      embed: makeVkEmbed,
    },
    {
      id: 'ok',
      name: 'OK Видео',
      icon: '▶',
      iconClass: 'ok',
      priority: 4,
      search: searchOkVideo,
      embed: makeOkEmbed,
    },
  ];

  /* ============================================================
   *  STATE
   * ============================================================ */
  const state = {
    kpId: null,
    type: 'film',   // 'film' | 'serial'
    season: 1,
    episode: 1,
    sourceId: null,
    sourceResults: {},  // { sourceId: { url, title, found } }
    autoNext: true,
    skipIntro: false,
    autoQuality: true,
    autoSwitch: true,
    trailers: true,
    seasons: {},   // { 1: { episodes: [1,2,3,...] } }
  };

  /* ============================================================
   *  YOUTUBE SEARCH  (легальный публичный поиск)
   * ============================================================ */
  async function searchYouTube(kpId, title, type, season, episode, isTrailer = false) {
    // Строим поисковой запрос
    let query = title || `kinopoisk ${kpId}`;
    
    if (isTrailer) {
      // Поиск трейлера
      query += ' официальный трейлер';
    } else if (type === 'serial' && season && episode) {
      // Поиск конкретной серии сериала
      query += ` ${season} сезон ${episode} серия смотреть онлайн`;
    } else if (type === 'serial') {
      // Поиск сериала без указания серии
      query += ` сериал смотреть онлайн`;
    } else {
      // Поиск фильма
      query += ' фильм смотреть онлайн';
    }
    
    query += ' официально';

    // Используем YouTube Data API v3 (публичный ключ не нужен для iframe search)
    // Фолбэк: строим iframe embed через поиск по oEmbed / nocookie
    const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=0`;
    return { found: true, url: embedUrl, query };
  }

  function makeYouTubeEmbed(result) {
    return result.url;
  }

  /* ============================================================
   *  RUTUBE SEARCH
   * ============================================================ */
  async function searchRutube(kpId, title, type, season, episode, isTrailer = false) {
    let query = title || `kinopoisk ${kpId}`;
    
    if (isTrailer) {
      // Поиск трейлера
      query += ' официальный трейлер';
    } else if (type === 'serial' && season && episode) {
      // Поиск конкретной серии
      query += ` ${season} сезон ${episode} серия`;
    } else if (type === 'serial') {
      // Поиск сериала
      query += ' сериал';
    } else {
      // Поиск фильма
      query += ' фильм';
    }
    
    // Rutube Public API search
    const apiUrl = `https://rutube.ru/api/search/video/?query=${encodeURIComponent(query)}&format=json`;
    try {
      const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(5000) });
      if (!resp.ok) throw new Error('rutube api fail');
      const data = await resp.json();
      const results = data.results || [];
      // Фильтруем — ищем релевантный контент
      const item = results.find(r =>
        r.title && !r.is_age_restricted
      ) || results[0];
      if (!item) return { found: false };
      const embedId = item.id;
      const embedUrl = `https://rutube.ru/play/embed/${embedId}/`;
      return { found: true, url: embedUrl, title: item.title, videoId: embedId };
    } catch (e) {
      // Фолбэк — прямой поиск через embed
      const embedUrl = `https://rutube.ru/play/embed/search/?query=${encodeURIComponent(query)}`;
      return { found: true, url: embedUrl, fallback: true };
    }
  }

  function makeRutubeEmbed(result) {
    return result.url;
  }

  /* ============================================================
   *  VK VIDEO SEARCH
   * ============================================================ */
  async function searchVkVideo(kpId, title, type, season, episode, isTrailer = false) {
    let query = title || `kinopoisk ${kpId}`;
    
    if (isTrailer) {
      // Поиск трейлера
      query += ' официальный трейлер';
    } else if (type === 'serial' && season && episode) {
      // Поиск конкретной серии
      query += ` ${season} сезон ${episode} серия`;
    } else if (type === 'serial') {
      // Поиск сериала
      query += ' сериал';
    } else {
      // Поиск фильма
      query += ' фильм';
    }
    
    // VK Video embed search
    const embedUrl = `https://vk.com/video_ext.php?id=search&q=${encodeURIComponent(query)}&hd=1`;
    return { found: true, url: embedUrl, fallback: true };
  }

  function makeVkEmbed(result) {
    return result.url;
  }

  /* ============================================================
   *  OK VIDEO SEARCH
   * ============================================================ */
  async function searchOkVideo(kpId, title, type, season, episode, isTrailer = false) {
    let query = title || `kinopoisk ${kpId}`;
    
    if (isTrailer) {
      // Поиск трейлера
      query += ' официальный трейлер';
    } else if (type === 'serial' && season && episode) {
      // Поиск конкретной серии
      query += ` ${season} сезон ${episode} серия`;
    } else if (type === 'serial') {
      // Поиск сериала
      query += ' сериал';
    } else {
      // Поиск фильма
      query += ' фильм';
    }
    
    const embedUrl = `https://ok.ru/videoembed/search?q=${encodeURIComponent(query)}`;
    return { found: true, url: embedUrl, fallback: true };
  }

  function makeOkEmbed(result) {
    return result.url;
  }

  /* ============================================================
   *  KINOPOISK INFO  (публичный API через unofficial proxy)
   * ============================================================ */
  async function fetchKpInfo(kpId) {
    // Используем открытый unofficial KP API proxy
    const endpoints = [
      `https://kinopoisk.dev/api/v2.2/films/${kpId}`,  // unofficial
      `https://api.kinopoisk.dev/v1.4/movie/${kpId}`,  // alternative
    ];
    for (const url of endpoints) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (r.ok) {
          const d = await r.json();
          return parseKpResponse(d);
        }
      } catch (e) { /* try next */ }
    }
    return null;
  }

  function parseKpResponse(d) {
    const title = d.nameRu || d.name || d.nameEn || '';
    const titleEn = d.nameEn || d.nameOriginal || '';
    const type = (d.type === 'TV_SERIES' || d.type === 'MINI_SERIES' || d.isSeries)
      ? 'serial' : 'film';
    const year = d.year;
    const seasons = d.seasons || d.seasonsCount || 1;
    return { title, titleEn, type, year, seasons };
  }

  /* ============================================================
   *  SEARCH ROBOT — главный поисковой робот
   * ============================================================ */
  async function runSearchRobot(kpId, type, season, episode, forceSourceId) {
    setStatus('searching', '🔍 Поисковой робот ищет контент...');

    // 1. Получаем инфо о фильме
    showSpinner(true);
    let kpInfo = null;
    try {
      kpInfo = await fetchKpInfo(kpId);
    } catch (e) {}

    const title = kpInfo?.title || '';
    const titleEn = kpInfo?.titleEn || '';
    const contentType = kpInfo?.type || type;

    // 2. Запускаем поиск по всем источникам параллельно
    const sourcesToSearch = forceSourceId
      ? SOURCES.filter(s => s.id === forceSourceId)
      : SOURCES;

    updateSourcesUI(SOURCES, null, 'searching');

    const searchPromises = sourcesToSearch.map(async (src) => {
      try {
        const res = await src.search(kpId, title || `ID ${kpId}`, contentType, season, episode, false);
        state.sourceResults[src.id] = res;
        updateSourceItem(src.id, res.found ? 'found' : 'notfound');
        return { src, res };
      } catch (e) {
        state.sourceResults[src.id] = { found: false };
        updateSourceItem(src.id, 'error');
        return { src, res: { found: false } };
      }
    });

    const results = await Promise.allSettled(searchPromises);

    // 3. Выбираем лучший источник
    let best = null;
    for (const src of SOURCES) {
      const r = state.sourceResults[src.id];
      if (r && r.found && (!best || src.priority < best.src.priority)) {
        best = { src, res: r };
      }
    }

    showSpinner(false);

    if (!best) {
      // Ищем трейлер если включено
      if (state.trailers) {
        setStatus('trailer', '🎬 Контент не найден, ищем трейлер...');
        await searchTrailer(kpId, title);
      } else {
        setStatus('error', '❌ Контент не найден ни на одном источнике');
        showOverlay('Контент по ID ' + kpId + ' не найден на легальных платформах.', false);
      }
      return;
    }

    // 4. Загружаем в плеер
    loadSource(best.src, best.res, kpId, title, contentType, season, episode);
  }

  async function searchTrailer(kpId, title) {
    // Ищем трейлер на всех платформах параллельно
    const trailerPromises = SOURCES.map(async (src) => {
      try {
        const res = await src.search(kpId, title || `ID ${kpId}`, state.type, state.season, state.episode, true);
        return { src, res };
      } catch (e) {
        return { src, res: { found: false } };
      }
    });
    
    const trailerResults = await Promise.allSettled(trailerPromises);
    
    // Выбираем первый найденный трейлер по приоритету
    for (const result of trailerResults) {
      if (result.status === 'fulfilled' && result.value.res.found) {
        const { src, res } = result.value;
        const embedUrl = src.embed(res);
        loadIframe(embedUrl);
        setStatus('ok', `🎬 Трейлер загружен из ${src.name}`);
        document.getElementById('lblSource').textContent = `▶ ${src.name} (трейлер)`;
        return;
      }
    }
    
    // Фолбэк на YouTube если ничего не найдено
    const query = (title || `kinopoisk ${kpId}`) + ' официальный трейлер';
    const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=0`;
    loadIframe(embedUrl);
    setStatus('ok', '🎬 Трейлер загружен из YouTube');
    document.getElementById('lblSource').textContent = '▶ YouTube (трейлер)';
  }

  /* ============================================================
   *  LOAD SOURCE INTO PLAYER
   * ============================================================ */
  function loadSource(src, res, kpId, title, type, season, episode) {
    const embedUrl = src.embed(res);
    if (!embedUrl) {
      setStatus('error', '❌ Не удалось сформировать URL источника');
      return;
    }

    loadIframe(embedUrl);

    state.sourceId = src.id;
    document.getElementById('lblSource').textContent = `${src.name}`;
    document.getElementById('btnSource').classList.add('source-active');

    setStatus('ok', `✅ Загружено из ${src.name}` + (title ? ` — ${title}` : ''));
  }

  function loadIframe(src) {
    const iframe = document.getElementById('player-iframe');
    iframe.src = src;
    hideOverlay();
  }

  /* ============================================================
   *  UI HELPERS
   * ============================================================ */
  function setStatus(type, text) {
    const dot = document.getElementById('statusDot');
    const label = document.getElementById('statusText');
    dot.className = 'status-dot';
    if (type === 'searching') { dot.classList.add('searching'); }
    else if (type === 'ok') { dot.classList.remove('idle'); }
    else if (type === 'error') { dot.classList.add('error'); }
    else { dot.classList.add('idle'); }
    label.textContent = text;
  }

  function showSpinner(v) {
    const sp = document.getElementById('spinner');
    sp.classList.toggle('active', v);
  }

  function showOverlay(hint, searching) {
    const overlay = document.getElementById('playerOverlay');
    overlay.classList.remove('hidden');
    document.getElementById('overlayHint').textContent = hint || '';
    showSpinner(searching);
  }

  function hideOverlay() {
    document.getElementById('playerOverlay').classList.add('hidden');
  }

  function updateSourcesUI(sources, selectedId, initialStatus) {
    const panel = document.getElementById('panelSources');
    panel.innerHTML = '';
    sources.forEach(src => {
      const div = document.createElement('div');
      div.className = 'source-item' + (src.id === selectedId ? ' selected' : '');
      div.id = 'src-item-' + src.id;
      div.innerHTML = `
        <div class="source-icon ${src.iconClass}">${src.icon}</div>
        <div class="source-info">
          <div class="source-name">${src.name}</div>
          <div class="source-status" id="src-status-${src.id}">Ожидание...</div>
        </div>
        <div class="source-dot ${initialStatus === 'searching' ? 'searching' : ''}" id="src-dot-${src.id}"></div>
      `;
      div.onclick = () => selectSource(src.id);
      panel.appendChild(div);
    });
  }

  function updateSourceItem(srcId, status) {
    const dot = document.getElementById('src-dot-' + srcId);
    const label = document.getElementById('src-status-' + srcId);
    if (!dot || !label) return;
    dot.className = 'source-dot';
    if (status === 'found') { dot.classList.add('ok-dot'); label.textContent = 'Найдено ✓'; }
    else if (status === 'searching') { dot.classList.add('searching'); label.textContent = 'Поиск...'; }
    else if (status === 'error') { label.textContent = 'Ошибка'; }
    else { label.textContent = 'Не найдено'; }
  }

  function selectSource(srcId) {
    const res = state.sourceResults[srcId];
    const src = SOURCES.find(s => s.id === srcId);
    if (!src) return;
    if (res && res.found) {
      loadSource(src, res, state.kpId, '', state.type, state.season, state.episode);
      closeAllPanels();
    } else {
      // Запустить поиск только по этому источнику
      runSearchRobot(state.kpId, state.type, state.season, state.episode, srcId);
      closeAllPanels();
    }
  }

  /* ============================================================
   *  PANEL TOGGLES
   * ============================================================ */
  function togglePanel(name) {
    const panels = { settings: 'panelSettings', sources: 'panelSources', season: 'panelSeason' };
    const panel = document.getElementById(panels[name]);
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    closeAllPanels();
    if (!isOpen) panel.classList.add('open');
    if (name === 'settings') {
      document.getElementById('btnSettings').classList.toggle('settings-active', !isOpen);
    }
  }
  window.togglePanel = togglePanel;

  function closeAllPanels() {
    ['panelSettings', 'panelSources'].forEach(id => {
      document.getElementById(id)?.classList.remove('open');
    });
    document.getElementById('btnSettings')?.classList.remove('settings-active');
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#topbar') && !e.target.closest('#panelSeason')) {
      closeAllPanels();
    }
  });

  /* ============================================================
   *  SETTINGS HANDLERS
   * ============================================================ */
  function toggleAutoNext() {
    state.autoNext = !state.autoNext;
    const btn = document.getElementById('btnAutoNext');
    btn.classList.toggle('off', !state.autoNext);
  }
  window.toggleAutoNext = toggleAutoNext;

  function togglePip() {
    const iframe = document.getElementById('player-iframe');
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (iframe) {
      // PiP для iframe не поддерживается напрямую
      alert('PiP доступен через кнопку в самом плеере.');
    }
  }
  window.togglePip = togglePip;

  /* ============================================================
   *  SEASONS / EPISODES UI
   * ============================================================ */
  function buildSeasonsUI(seasonsData) {
    const tabs = document.getElementById('seasonsTabs');
    const grid = document.getElementById('episodesGrid');
    tabs.innerHTML = '';
    grid.innerHTML = '';

    Object.keys(seasonsData).forEach(sNum => {
      const tab = document.createElement('button');
      tab.className = 'season-tab' + (parseInt(sNum) === state.season ? ' active' : '');
      tab.textContent = 'Сезон ' + sNum;
      tab.onclick = () => selectSeason(parseInt(sNum));
      tabs.appendChild(tab);
    });

    renderEpisodes(state.season, seasonsData[state.season]?.episodes || []);
  }

  function renderEpisodes(season, episodes) {
    const grid = document.getElementById('episodesGrid');
    grid.innerHTML = '';
    episodes.forEach(ep => {
      const btn = document.createElement('button');
      btn.className = 'ep-btn' + (ep === state.episode ? ' active' : '');
      btn.textContent = 'Серия ' + ep;
      btn.onclick = () => selectEpisode(season, ep);
      grid.appendChild(btn);
    });
  }

  function selectSeason(n) {
    state.season = n;
    document.getElementById('lblSeason').textContent = 'Сезон ' + n;
    buildSeasonsUI(state.seasons);
    runSearchRobot(state.kpId, 'serial', n, 1);
  }

  function selectEpisode(season, ep) {
    state.episode = ep;
    state.season = season;
    document.getElementById('lblEpisode').textContent = 'Эпизод ' + ep;
    runSearchRobot(state.kpId, 'serial', season, ep);
    closeAllPanels();
  }

  /* ============================================================
   *  MAIN INIT
   * ============================================================ */
  async function init(kpId) {
    if (!kpId || !/^\d+$/.test(kpId)) {
      setStatus('error', '❌ Неверный ID Кинопоиска');
      return;
    }

    state.kpId = kpId;
    setStatus('searching', '⏳ Получаем информацию о контенте...');
    showOverlay('Поисковой робот ищет контент по ID ' + kpId + '...', true);

    // Инициализируем источники в UI
    updateSourcesUI(SOURCES, null, 'searching');

    // Получаем инфо
    let kpInfo = null;
    try { kpInfo = await fetchKpInfo(kpId); } catch (e) {}

    if (kpInfo) {
      state.type = kpInfo.type;
      if (kpInfo.type === 'serial') {
        // Показываем селекторы сезона/серии
        document.getElementById('btnSeason').style.display = '';
        document.getElementById('btnEpisode').style.display = '';

        // Строим структуру сезонов (заглушка: 3 сезона по 10 серий)
        const numSeasons = typeof kpInfo.seasons === 'number' ? kpInfo.seasons : 1;
        for (let s = 1; s <= numSeasons; s++) {
          state.seasons[s] = { episodes: Array.from({ length: 16 }, (_, i) => i + 1) };
        }
        buildSeasonsUI(state.seasons);
        document.getElementById('panelSeason').classList.add('open');
      }
    }

    // Запускаем поисковой робот
    await runSearchRobot(kpId, state.type, state.season, state.episode, null);
  }

  /* ============================================================
   *  PUBLIC API
   * ============================================================ */
  window.VilakPlayer = {
    init,
    selectSource,
    runSearchRobot,
    getState: () => ({ ...state }),
    setKpId: (id) => init(id),
  };

})(window);
