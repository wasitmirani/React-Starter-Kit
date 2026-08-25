
"use strict";
(() => {
  var navbar = document.getElementById("sidebar");
  var navbar1 = document.getElementById("header");
  if (!navbar || !navbar1) return;

  function stickyFn() {
    if (window.scrollY >= 75) {
      navbar.classList.add("sticky-pin")
      navbar1.classList.add("sticky-pin")
    } else {
      navbar.classList.remove("sticky-pin");
      navbar1.classList.remove("sticky-pin");
    }
  }
  window.addEventListener('scroll', stickyFn);
  window.addEventListener('DOMContentLoaded', stickyFn);
  stickyFn();
})();

