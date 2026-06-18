(function () {
    var navButton = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.spotlight-slide'));
        var dotsHost = carousel.querySelector('[data-carousel-dots]');
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        var current = 0;
        var timer = null;

        function render(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            if (dotsHost) {
                Array.prototype.slice.call(dotsHost.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                render(current + 1);
            }, 5200);
        }

        if (dotsHost) {
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换焦点影片');
                dot.addEventListener('click', function () {
                    render(index);
                    play();
                });
                dotsHost.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                render(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                render(current + 1);
                play();
            });
        }

        if (slides.length > 0) {
            render(0);
            play();
        }
    });

    function applySearch(listName) {
        var list = document.querySelector('[data-list="' + listName + '"]');
        if (!list) {
            return;
        }
        var input = document.querySelector('[data-search-target="' + listName + '"]');
        var activeChip = document.querySelector('[data-filter-group="' + listName + '"] .filter-chip.is-active');
        var term = input ? input.value.trim().toLowerCase() : '';
        var kind = activeChip ? activeChip.getAttribute('data-filter-value') : '';
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        cards.forEach(function (item) {
            var text = (item.getAttribute('data-search') || '').toLowerCase();
            var itemKind = item.getAttribute('data-kind') || '';
            var matchesText = !term || text.indexOf(term) !== -1;
            var matchesKind = !kind || itemKind.indexOf(kind) !== -1 || text.indexOf(kind.toLowerCase()) !== -1;
            item.classList.toggle('is-filter-hidden', !(matchesText && matchesKind));
        });
    }

    document.querySelectorAll('.site-search').forEach(function (input) {
        var target = input.getAttribute('data-search-target');
        input.addEventListener('input', function () {
            applySearch(target);
        });
    });

    document.querySelectorAll('.filter-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            var group = chip.closest('[data-filter-group]');
            if (!group) {
                return;
            }
            Array.prototype.slice.call(group.querySelectorAll('.filter-chip')).forEach(function (item) {
                item.classList.remove('is-active');
            });
            chip.classList.add('is-active');
            applySearch(group.getAttribute('data-filter-group'));
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-player-start]');
        var streamUrl = shell.getAttribute('data-stream');
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (!video || !streamUrl || attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            }
        }

        function startPlayer() {
            attachStream();
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video) {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', startPlayer);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
