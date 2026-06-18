(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  var grid = document.querySelector('[data-filter-grid]');
  var input = document.querySelector('[data-search-input]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var emptyState = document.querySelector('[data-empty-state]');

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var keyword = normalize(input ? input.value : '');
    var region = normalize(regionFilter ? regionFilter.value : '');
    var type = normalize(typeFilter ? typeFilter.value : '');
    var year = normalize(yearFilter ? yearFilter.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && cardRegion.indexOf(region) === -1) {
        matched = false;
      }

      if (type && cardType.indexOf(type) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (input) {
    var query = getQueryParam('q');

    if (query) {
      input.value = query;
    }

    input.addEventListener('input', applyFilters);
  }

  [regionFilter, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
