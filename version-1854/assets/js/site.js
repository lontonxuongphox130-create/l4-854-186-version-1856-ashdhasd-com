(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-failed");
      }, { once: true });
    });

    setupHero();
    setupPageFilter();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }
  }

  function setupPageFilter() {
    var form = document.querySelector("[data-page-filter]");
    if (!form) {
      return;
    }

    var input = form.querySelector("input");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
      var keyword = (input.value || "").trim().toLowerCase();

      cards.forEach(function (card) {
        var source = (card.getAttribute("data-search") || "").toLowerCase();
        card.hidden = keyword.length > 0 && source.indexOf(keyword) === -1;
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    input.addEventListener("input", applyFilter);
  }
})();
