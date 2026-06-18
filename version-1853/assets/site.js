
import { H as Hls } from './video-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
    const toggle = $('[data-mobile-toggle]');
    const menu = $('[data-mobile-menu]');
    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });
}

function initHeroCarousel() {
    const carousel = $('[data-hero-carousel]');
    if (!carousel) {
        return;
    }

    const slides = $$('[data-hero-slide]', carousel);
    const dots = $$('[data-hero-dot]', carousel);
    const previous = $('[data-hero-prev]', carousel);
    const next = $('[data-hero-next]', carousel);
    let current = 0;
    let timer = null;

    const show = (index) => {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    if (previous) {
        previous.addEventListener('click', () => {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(current + 1);
            start();
        });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
}

function initCardFilters() {
    $$('[data-card-filter]').forEach((input) => {
        const container = input.closest('section') || document;
        const cards = $$('[data-movie-card]', container);

        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            cards.forEach((card) => {
                const haystack = (card.dataset.search || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden', query && !haystack.includes(query));
            });
        });
    });
}

function createSearchCard(movie) {
    const tags = (movie.tags || [])
        .slice(0, 3)
        .map((tag) => `<span>${escapeHtml(tag)}</span>`)
        .join('');

    return `
        <article class="movie-card" data-movie-card data-search="${escapeHtml([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine
        ].join(' '))}">
            <a class="poster" href="${escapeHtml(movie.url)}">
                <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="poster-gradient"></span>
                <span class="year-badge">${escapeHtml(movie.year)}</span>
                <span class="play-badge">播放</span>
            </a>
            <div class="movie-card-body">
                <a href="${escapeHtml(movie.url)}" class="movie-title">${escapeHtml(movie.title)}</a>
                <p>${escapeHtml(movie.oneLine)}</p>
                <div class="movie-meta">
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.type)}</span>
                    <a href="category-${escapeHtml(movie.categorySlug)}.html">${escapeHtml(movie.categoryName)}</a>
                </div>
                <div class="tag-list">${tags}</div>
            </div>
        </article>
    `;
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
    const results = $('[data-search-results]');
    const status = $('[data-search-status]');
    const input = $('[data-search-input]');
    const movies = window.MOVIE_INDEX || [];

    if (!results || !status || !input || !movies.length) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    input.value = q;

    const render = (query) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            results.innerHTML = '';
            status.textContent = '可在上方输入关键词进行搜索。';
            return;
        }

        const matched = movies.filter((movie) => {
            const haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();
            return haystack.includes(normalized);
        });

        status.textContent = matched.length
            ? `找到 ${matched.length} 条与“${query}”相关的影片。`
            : `没有找到与“${query}”完全匹配的影片。`;
        results.innerHTML = matched.slice(0, 120).map(createSearchCard).join('');
    };

    render(q);
}

function showPlayerMessage(video, text) {
    const shell = video.closest('.video-shell');
    const message = shell ? $('[data-player-message]', shell) : null;
    if (!message) {
        return;
    }
    message.textContent = text;
    message.classList.add('show');
    window.setTimeout(() => message.classList.remove('show'), 3600);
}

function attachHls(video, source) {
    if (!source) {
        showPlayerMessage(video, '播放源暂不可用');
        return Promise.reject(new Error('Missing video source'));
    }

    if (video.dataset.boundSource === source) {
        return video.play();
    }

    if (video._hls) {
        video._hls.destroy();
        video._hls = null;
    }

    video.dataset.boundSource = source;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return video.play();
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        video._hls = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise((resolve, reject) => {
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().then(resolve).catch(reject);
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    showPlayerMessage(video, '播放源加载失败，请稍后重试');
                    reject(new Error(data.type || 'HLS fatal error'));
                }
            });
        });
    }

    video.src = source;
    return video.play();
}

function initPlayers() {
    $$('[data-video-target]').forEach((button) => {
        button.addEventListener('click', () => {
            const video = document.getElementById(button.dataset.videoTarget || '');
            if (!video) {
                return;
            }
            const source = button.dataset.src || video.dataset.src || '';
            const shell = video.closest('.video-shell');
            const overlay = shell ? $('.js-play-button', shell) : null;

            if (overlay) {
                overlay.classList.add('hidden');
            }

            attachHls(video, source).catch(() => {
                if (overlay) {
                    overlay.classList.remove('hidden');
                }
            });
        });
    });

    $$('.js-player').forEach((video) => {
        video.addEventListener('click', () => {
            if (!video.dataset.boundSource) {
                attachHls(video, video.dataset.src || '').catch(() => {});
            }
        });
    });
}

initMobileMenu();
initHeroCarousel();
initCardFilters();
initSearchPage();
initPlayers();
