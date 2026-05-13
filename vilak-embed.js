/**
 * Vilak.tv Embed SDK v1.0
 * Универсальный скрипт для встраивания плеера Vilak.tv на сторонние сайты
 *
 * Использование:
 *
 * Вариант 1 — div + script:
 *   <div id="vilak-player"></div>
 *   <script src="https://vilak.tv/vilak-embed.js"></script>
 *   <script>
 *     Vilak('#vilak-player', { kpId: 301 });
 *   </script>
 *
 * Вариант 2 — iframe:
 *   <iframe src="https://vilak.tv/301" width="100%" height="500" allowfullscreen></iframe>
 *
 * Вариант 3 — data-атрибут (авто):
 *   <div class="vilak-auto" data-kpid="301" data-type="serial"></div>
 *   <script src="https://vilak.tv/vilak-embed.js" async></script>
 *
 * Сделано с ❤ для KinoplayerTop
 */

(function (window, document) {
  'use strict';

  var BASE_URL = 'https://vilak.tv';
  var DEFAULT_HEIGHT = 500;
  var DEFAULT_RATIO = '56.25%'; // 16:9

  /**
   * Основная функция создания плеера
   * @param {string|HTMLElement} target - селектор или элемент
   * @param {object} options
   * @param {number|string} options.kpId - ID Кинопоиска (обязательно)
   * @param {string} [options.type] - 'film' | 'serial'
   * @param {number} [options.season] - номер сезона
   * @param {number} [options.episode] - номер серии
   * @param {string} [options.width] - ширина (default: 100%)
   * @param {number} [options.height] - высота в px (default: авто 16:9)
   * @param {boolean} [options.autoplay] - автозапуск
   * @param {boolean} [options.responsive] - адаптивная высота (default: true)
   */
  function Vilak(target, options) {
    options = options || {};

    var el = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!el) {
      console.error('[Vilak.tv] Элемент не найден:', target);
      return;
    }

    if (!options.kpId) {
      console.error('[Vilak.tv] Не передан kpId');
      return;
    }

    var kpId = String(options.kpId);
    var type = options.type || 'film';
    var season = options.season || 1;
    var episode = options.episode || 1;
    var width = options.width || '100%';
    var responsive = options.responsive !== false;
    var autoplay = options.autoplay ? 1 : 0;

    // Формируем URL
    var src = BASE_URL + '/' + kpId;
    var params = [];
    if (type === 'serial') params.push('type=serial', 's=' + season, 'e=' + episode);
    if (autoplay) params.push('autoplay=1');
    if (params.length) src += '?' + params.join('&');

    // Создаём обёртку
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:' + width + '; position:relative; background:#000; border-radius:8px; overflow:hidden;';

    if (responsive) {
      wrapper.style.paddingBottom = DEFAULT_RATIO;
      wrapper.style.height = '0';
    }

    // Создаём iframe
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('data-vilak-id', kpId);

    if (responsive) {
      iframe.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; border:none;';
    } else {
      var h = options.height || DEFAULT_HEIGHT;
      iframe.style.cssText = 'width:100%; height:' + h + 'px; border:none; display:block;';
      wrapper.style.height = h + 'px';
    }

    wrapper.appendChild(iframe);

    // Очищаем и вставляем
    el.innerHTML = '';
    el.appendChild(wrapper);

    // Возвращаем объект управления
    return {
      iframe: iframe,
      setSeason: function (s) {
        iframe.src = BASE_URL + '/' + kpId + '?type=serial&s=' + s + '&e=1';
      },
      setEpisode: function (s, e) {
        iframe.src = BASE_URL + '/' + kpId + '?type=serial&s=' + s + '&e=' + e;
      },
      destroy: function () {
        el.innerHTML = '';
      },
    };
  }

  /* ============================================================
   *  AUTO-INIT: data-атрибуты
   * ============================================================ */
  function autoInit() {
    var elements = document.querySelectorAll('.vilak-auto, [data-vilak]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.dataset.vilakInited) continue;
      el.dataset.vilakInited = '1';
      var kpId = el.dataset.kpid || el.dataset.vilak;
      if (!kpId) continue;
      Vilak(el, {
        kpId: kpId,
        type: el.dataset.type || 'film',
        season: parseInt(el.dataset.season) || 1,
        episode: parseInt(el.dataset.episode) || 1,
        height: parseInt(el.dataset.height) || null,
        autoplay: el.dataset.autoplay === '1' || el.dataset.autoplay === 'true',
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */
  window.Vilak = Vilak;

})(window, document);
