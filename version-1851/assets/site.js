import { H as Hls } from './video-vendor-dru42stk.js';

function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function initHeroSlider() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let activeIndex = 0;
  let timer = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5600);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      restartTimer();
    });
  });

  if (previous) {
    previous.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      restartTimer();
    });
  }

  restartTimer();
}

function initCardFilters() {
  document.querySelectorAll('[data-card-filter]').forEach((filterBar) => {
    const root = filterBar.closest('section');
    const searchInput = filterBar.querySelector('[data-filter-search]');
    const buttons = Array.from(filterBar.querySelectorAll('[data-filter-value]'));
    const cards = root ? Array.from(root.querySelectorAll('[data-movie-card]')) : [];
    let activeType = 'all';

    function applyFilter() {
      const query = (searchInput?.value || '').trim().toLowerCase();

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const type = card.dataset.type || '';
        const matchesText = !query || text.includes(query);
        const matchesType = activeType === 'all' || type === activeType;
        card.classList.toggle('hidden-by-filter', !(matchesText && matchesType));
      });
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        activeType = button.dataset.filterValue || 'all';
        buttons.forEach((item) => item.classList.toggle('active', item === button));
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
  });
}

function createSearchCard(movie) {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
<article class="movie-card" data-movie-card>
  <a class="card-cover" href="${movie.href}" aria-label="观看 ${escapeHtml(movie.title)}">
    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="play-mark">▶</span>
    <span class="year-mark">${escapeHtml(movie.year)}</span>
  </a>
  <div class="card-body">
    <div class="card-meta">
      <a href="./category-${escapeHtml(movie.categorySlug)}.html">${escapeHtml(movie.categoryName)}</a>
      <span>${escapeHtml(movie.region)}</span>
    </div>
    <h3><a href="${movie.href}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="mini-tags">${tags}</div>
  </div>
</article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initSearchPage() {
  const data = window.MOVIE_SEARCH_DATA;
  const input = document.querySelector('[data-search-input]');
  const category = document.querySelector('[data-search-category]');
  const region = document.querySelector('[data-search-region]');
  const year = document.querySelector('[data-search-year]');
  const reset = document.querySelector('[data-search-reset]');
  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');

  if (!Array.isArray(data) || !input || !category || !region || !year || !results || !summary) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';
  if (params.get('category')) {
    category.value = params.get('category');
  }
  if (params.get('year')) {
    year.value = params.get('year');
  }

  function runSearch() {
    const keyword = input.value.trim().toLowerCase();
    const categoryValue = category.value;
    const regionValue = region.value.trim().toLowerCase();
    const yearValue = year.value.trim();

    const matched = data.filter((movie) => {
      const haystack = [
        movie.title,
        movie.oneLine,
        movie.summary,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.categoryName,
        movie.tags.join(' ')
      ].join(' ').toLowerCase();

      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesCategory = categoryValue === 'all' || movie.categorySlug === categoryValue;
      const matchesRegion = !regionValue || movie.region.toLowerCase().includes(regionValue);
      const matchesYear = !yearValue || movie.year === yearValue;

      return matchesKeyword && matchesCategory && matchesRegion && matchesYear;
    });

    const limited = matched.slice(0, 120);
    results.innerHTML = limited.map(createSearchCard).join('');
    summary.textContent = `共匹配 ${matched.length} 部影片，当前显示 ${limited.length} 部。`;
  }

  [input, category, region, year].forEach((control) => {
    control.addEventListener('input', runSearch);
    control.addEventListener('change', runSearch);
  });

  if (reset) {
    reset.addEventListener('click', () => {
      input.value = '';
      category.value = 'all';
      region.value = '';
      year.value = '';
      runSearch();
    });
  }

  runSearch();
}

function initHlsPlayers() {
  document.querySelectorAll('[data-hls-player]').forEach((shell) => {
    const video = shell.querySelector('video[data-src]');
    const playButton = shell.querySelector('[data-play-button]');
    const status = shell.querySelector('[data-player-status]');
    let hlsInstance = null;
    let initialized = false;

    if (!video || !playButton) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    async function startPlayback() {
      const source = video.dataset.src;

      if (!source) {
        setStatus('未找到播放源');
        return;
      }

      if (!initialized) {
        initialized = true;
        setStatus('正在初始化 HLS...');

        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            setStatus('播放源已就绪');
            video.play().catch(() => setStatus('请再次点击播放'));
          });

          hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络异常，正在重试');
              hlsInstance.startLoad();
              return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体异常，正在恢复');
              hlsInstance.recoverMediaError();
              return;
            }

            setStatus('播放失败，请稍后重试');
            hlsInstance.destroy();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', () => setStatus('播放源已就绪'), { once: true });
        } else {
          setStatus('当前浏览器不支持 HLS 播放');
          return;
        }
      }

      shell.classList.add('is-playing');
      video.controls = true;
      video.play().catch(() => setStatus('请再次点击播放'));
    }

    playButton.addEventListener('click', startPlayback);

    video.addEventListener('play', () => {
      shell.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('pause', () => {
      setStatus('已暂停');
    });

    video.addEventListener('ended', () => {
      setStatus('播放结束');
    });

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroSlider();
  initCardFilters();
  initSearchPage();
  initHlsPlayers();
});
