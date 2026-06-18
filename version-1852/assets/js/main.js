(function () {
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    startHero();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters(scope) {
    var cards = Array.prototype.slice.call(scope.parentElement.querySelectorAll("[data-movie-card]"));
    var input = scope.querySelector("[data-filter-input]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var year = scope.querySelector("[data-filter-year]");
    var empty = scope.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function apply() {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var shown = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute("data-search"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (query && search.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
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

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(initFilters);

  var hlsLoader = null;

  function loadPlayerLibrary() {
    if (window.Hls) {
      return Promise.resolve();
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoader;
  }

  function bindPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play]");
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute("data-video-src");
    var ready = false;
    var hlsInstance = null;

    function attach() {
      if (ready || !source) {
        return Promise.resolve();
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      return loadPlayerLibrary().then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }).catch(function () {
        video.src = source;
      });
    }

    function start() {
      button.classList.add("is-hidden");
      attach().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", start);
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bindPlayer);
})();
