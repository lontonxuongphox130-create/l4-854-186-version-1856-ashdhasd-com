(function () {
  var input = document.getElementById('search-input');
  var type = document.getElementById('search-type');
  var button = document.getElementById('search-button');
  var results = document.getElementById('search-results');
  var empty = document.getElementById('search-empty');
  var data = window.SEARCH_MOVIES || [];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + movie.href + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<span class="poster-wrap">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-glow"></span>',
      '<span class="play-mark">▶</span>',
      '<span class="region-badge">' + escapeHtml(movie.region) + '</span>',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="year-line">' + escapeHtml(movie.year + ' · ' + movie.genre.split(/[、,，/]/)[0]) + '</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<em>' + escapeHtml(movie.oneLine) + '</em>',
      '</span>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function render() {
    if (!results) {
      return;
    }

    var q = normalize(input && input.value);
    var selectedType = normalize(type && type.value);
    var matches = data.filter(function (movie) {
      var target = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' '));
      return (!q || target.indexOf(q) !== -1) && (!selectedType || normalize(movie.type).indexOf(selectedType) !== -1);
    }).slice(0, 120);

    results.innerHTML = matches.map(card).join('');

    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  }

  var initial = params().get('q') || '';

  if (input) {
    input.value = initial;
    input.addEventListener('input', render);
  }

  if (type) {
    type.addEventListener('change', render);
  }

  if (button) {
    button.addEventListener('click', render);
  }

  render();
})();
