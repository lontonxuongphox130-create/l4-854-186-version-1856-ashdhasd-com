(function () {
    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector(".mobile-toggle");
        var nav = document.getElementById("mobileNav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function setupSearch() {
        var root = document.querySelector("[data-search-page]");
        if (!root) {
            return;
        }
        var input = document.getElementById("searchInput");
        var region = document.getElementById("regionFilter");
        var type = document.getElementById("typeFilter");
        var year = document.getElementById("yearFilter");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
        var empty = document.getElementById("emptyState");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (input && q) {
            input.value = q;
        }

        function matches(card) {
            var query = normalize(input ? input.value : "");
            var r = normalize(region ? region.value : "");
            var t = normalize(type ? type.value : "");
            var y = normalize(year ? year.value : "");
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
            if (query && text.indexOf(query) === -1) {
                return false;
            }
            if (r && normalize(card.getAttribute("data-region")) !== r) {
                return false;
            }
            if (t && normalize(card.getAttribute("data-type")) !== t) {
                return false;
            }
            if (y && normalize(card.getAttribute("data-year")) !== y) {
                return false;
            }
            return true;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.mountPlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function load() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    hls.on(window.Hls.Events.ERROR, function () {
                        resolve();
                    });
                });
            }
            video.src = source;
            return Promise.resolve();
        }

        function play() {
            hideOverlay();
            load().then(function () {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("play", hideOverlay);
        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });
    };

    onReady(function () {
        setupMobileNav();
        setupHero();
        setupSearch();
    });
})();
