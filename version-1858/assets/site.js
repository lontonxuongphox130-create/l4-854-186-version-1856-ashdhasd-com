(function () {
  const body = document.body;
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-img-missing');
    }, { once: true });
  });

  const sliders = document.querySelectorAll('[data-hero-slider]');
  sliders.forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        play();
      });
    });

    show(0);
    play();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const section = panel.closest('[data-filter-scope]') || document;
    const cards = Array.from(section.querySelectorAll('.js-card'));
    const search = panel.querySelector('[data-filter-search]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const reset = panel.querySelector('[data-filter-reset]');
    const count = section.querySelector('[data-result-count]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      const q = normalize(search && search.value);
      const y = year ? year.value : '';
      const t = type ? type.value : '';
      let visible = 0;
      cards.forEach(function (card) {
        const text = normalize(card.textContent + ' ' + Object.values(card.dataset).join(' '));
        const okSearch = !q || text.includes(q);
        const okYear = !y || card.dataset.year === y;
        const okType = !t || card.dataset.type === t;
        const ok = okSearch && okYear && okType;
        card.hidden = !ok;
        if (ok) visible += 1;
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    [search, year, type].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) search.value = '';
        if (year) year.value = '';
        if (type) type.value = '';
        apply();
      });
    }

    apply();
  });
})();
