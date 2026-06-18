(function () {
  var header = document.querySelector('.site-header');
  var menu = document.querySelector('.menu-toggle');

  if (header && menu) {
    menu.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-index')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  var filterInput = document.querySelector('.card-filter');
  var regionFilter = document.querySelector('.region-filter');
  var typeFilter = document.querySelector('.type-filter');
  var grid = document.querySelector('.filterable-grid');
  var empty = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyCardFilter() {
    if (!grid) {
      return;
    }

    var q = normalize(filterInput && filterInput.value);
    var region = normalize(regionFilter && regionFilter.value);
    var type = normalize(typeFilter && typeFilter.value);
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var target = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var match = (!q || target.indexOf(q) !== -1) && (!region || cardRegion.indexOf(region) !== -1) && (!type || cardType.indexOf(type) !== -1);

      card.hidden = !match;

      if (match) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  [filterInput, regionFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyCardFilter);
      control.addEventListener('change', applyCardFilter);
    }
  });

  applyCardFilter();
})();
