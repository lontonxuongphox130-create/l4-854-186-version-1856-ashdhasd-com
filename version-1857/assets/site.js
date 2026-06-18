document.addEventListener("DOMContentLoaded", function() {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (toggle && menu) {
        toggle.addEventListener("click", function() {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function schedule() {
        if (timer) {
            clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = setInterval(function() {
                showSlide(current + 1);
            }, 5000);
        }
    }

    if (next) {
        next.addEventListener("click", function() {
            showSlide(current + 1);
            schedule();
        });
    }

    if (prev) {
        prev.addEventListener("click", function() {
            showSlide(current - 1);
            schedule();
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            schedule();
        });
    });

    schedule();

    var filterSections = Array.prototype.slice.call(document.querySelectorAll("[data-filterable]"));
    filterSections.forEach(function(grid) {
        var section = grid.closest("section") || document;
        var search = section.querySelector(".site-search");
        var region = section.querySelector(".filter-region");
        var year = section.querySelector(".filter-year");
        var type = section.querySelector(".filter-type");
        var empty = section.querySelector(".empty-state");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-item"));

        function valueOf(control) {
            return control ? control.value.trim().toLowerCase() : "";
        }

        function applyFilters() {
            var keyword = valueOf(search);
            var regionValue = valueOf(region);
            var yearValue = valueOf(year);
            var typeValue = valueOf(type);
            var visible = 0;

            cards.forEach(function(card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
                    matched = false;
                }
                if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
                    matched = false;
                }
                if (typeValue && (card.getAttribute("data-type") || "").toLowerCase() !== typeValue) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [search, region, year, type].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
});
