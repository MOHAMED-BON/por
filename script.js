(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var root = document.documentElement;

  /* ---------- Theme toggle (persisted) ---------- */
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("portfolio-theme"); } catch (e) {}
  if (savedTheme === "dark" || savedTheme === "light") root.setAttribute("data-theme", savedTheme);

  $("#themeToggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("portfolio-theme", next); } catch (e) {}
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Navbar: scrolled state, mobile menu, active link ---------- */
  var nav = $("#nav");
  var navLinks = $("#navLinks");
  var menuToggle = $("#menuToggle");

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }, { passive: true });

  menuToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", navLinks).forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  var sections = $$("main section[id]");
  var links = $$("a", navLinks);
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Card glow follows the mouse ---------- */
  $$(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
      card.style.setProperty("--my", (e.clientY - rect.top) + "px");
    });
  });

  /* ---------- Projects filter ---------- */
  var filterButtons = $$(".filter");
  var projects = $$(".project");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      filterButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });

      projects.forEach(function (project) {
        var categories = project.getAttribute("data-category").split(" ");
        var show = filter === "all" || categories.indexOf(filter) !== -1;
        project.classList.remove("pop");
        project.classList.toggle("hide", !show);
        if (show) {
          project.classList.add("is-visible");
          void project.offsetWidth; /* restart animation */
          project.classList.add("pop");
        }
      });
    });
  });

  /* ---------- Custom cursor (smooth follow) ---------- */
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canHover && !reduceMotion) {
    var ring = $(".cursor");
    var dot = $(".cursor-dot");
    var mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    document.body.classList.add("has-cursor");

    window.addEventListener("pointermove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = "translate(" + (mouseX - 3) + "px," + (mouseY - 3) + "px)";
    });

    (function loop() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      var half = ring.offsetWidth / 2;
      ring.style.transform = "translate(" + (ringX - half) + "px," + (ringY - half) + "px)";
      requestAnimationFrame(loop);
    })();

    $$("a, button, input, textarea, .card").forEach(function (el) {
      el.addEventListener("pointerenter", function () { ring.classList.add("grow"); });
      el.addEventListener("pointerleave", function () { ring.classList.remove("grow"); });
    });
  }

  /* ---------- Contact form validation ---------- */
  var form = $("#contactForm");
  var note = $("#formNote");

  function validate(field, test) {
    var wrap = field.closest(".field");
    var ok = test(field.value.trim());
    wrap.classList.toggle("invalid", !ok);
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameOk = validate(form.name, function (v) { return v.length >= 2; });
    var emailOk = validate(form.email, function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); });
    var msgOk = validate(form.message, function (v) { return v.length >= 10; });

    if (!(nameOk && emailOk && msgOk)) {
      note.textContent = "";
      return;
    }

    /* Replace this block with a real request (fetch to your API, Formspree, EmailJS ...) */
    var button = form.querySelector("button[type=submit]");
    button.disabled = true;
    note.textContent = "Sending...";
    setTimeout(function () {
      note.textContent = "Thank you! Your message has been sent. I'll reply soon.";
      form.reset();
      button.disabled = false;
    }, 900);
  });

  $$("input, textarea", form).forEach(function (input) {
    input.addEventListener("input", function () {
      input.closest(".field").classList.remove("invalid");
    });
  });
})();