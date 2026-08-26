
"use strict";
(() => {
  function stickyFn() {
    var navbar = document.getElementById("sidebar");
    var navbar1 = document.getElementById("header");
    if (!navbar || !navbar1) return;

    if (window.scrollY >= 75) {
      navbar.classList.add("sticky-pin")
      navbar1.classList.add("sticky-pin")
    } else {
      navbar.classList.remove("sticky-pin");
      navbar1.classList.remove("sticky-pin");
    }
  }

  // Avoid stacking listeners if this file is re-executed
  if (window.__nilovaStickyScroll) {
    window.removeEventListener('scroll', window.__nilovaStickyScroll);
  }
  window.__nilovaStickyScroll = stickyFn;
  window.addEventListener('scroll', stickyFn);
  stickyFn();
})();
