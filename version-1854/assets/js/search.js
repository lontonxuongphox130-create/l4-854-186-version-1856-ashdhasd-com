(function () {
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var title = document.getElementById("search-title");
  var count = document.getElementById("search-count");

  if (!input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var keyword = (params.get("q") || "").trim();
  input.value = keyword;

  fetch("assets/data/search-index.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (movies) {
      renderSearch(movies, keyword);

      input.closest("form").addEventListener("submit", function (event) {
        event.preventDefault();
        keyword = input.value.trim();
        renderSearch(movies, keyword);
        var query = keyword ? "?q=" + encodeURIComponent(keyword) : "";
        history.replaceState(null, "", "search.html" + query);
      });
    });

  function renderSearch(movies, keyword) {
    var normalized = keyword.toLowerCase();
    var matched = movies.filter(function (movie) {
      if (!normalized) {
        return true;
      }

      return movie.search.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 240);

    title.textContent = keyword ? "搜索：“" + keyword + "”" : "全部影片";
    count.textContent = "显示 " + matched.length + " 条结果";
    results.innerHTML = matched.map(createCard).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>#" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card movie-card--default\" data-movie-card>",
      "  <a href=\"video/" + escapeHtml(movie.id) + ".html\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
      "    <figure class=\"poster-frame\">",
      "      <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "      <figcaption>" + escapeHtml(movie.year) + "</figcaption>",
      "      <span class=\"play-hover\">▶</span>",
      "    </figure>",
      "    <div class=\"card-body\">",
      "      <div class=\"card-kicker\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "      <h3>" + escapeHtml(movie.title) + "</h3>",
      "      <p>" + escapeHtml(movie.oneLine) + "</p>",
      "      <div class=\"tag-row\"><a href=\"category/" + escapeHtml(movie.categorySlug) + ".html\">" + escapeHtml(movie.categoryName) + "</a>" + tags + "</div>",
      "    </div>",
      "  </a>",
      "</article>"
    ].join("\n");
  }
})();
