(function () {
  "use strict";

  /* page loader — React AppSplash owns boot fade; don't interrupt it */
  function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    if (loader.classList.contains("saas-splash--force") && !loader.classList.contains("is-done")) {
      return;
    }
    loader.classList.add("hidden!", "is-done");
    loader.setAttribute("aria-hidden", "true");
  }
  window.addEventListener("load", hideLoader);
  /* page loader */

  //switcher color pickers
  const pickrContainerPrimary = document.querySelector(".pickr-container-primary");
  const themeContainerPrimary = document.querySelector(".theme-container-primary");
  const pickrContainerBackground = document.querySelector(".pickr-container-background");
  const themeContainerBackground = document.querySelector(".theme-container-background");

  /* for theme primary */
  const nanoThemes = [
    [
      "nano",
      {
        defaultRepresentation: "RGB",
        components: {
          preview: true,
          opacity: false,
          hue: true,

          interaction: {
            hex: false,
            rgba: true,
            hsva: false,
            input: true,
            clear: false,
            save: false,
          },
        },
      },
    ],
  ];
  const nanoButtons = [];
  let nanoPickr = null;
  for (const [theme, config] of nanoThemes) {
    const button = document.createElement("button");
    button.innerHTML = theme;
    nanoButtons.push(button);

    button.addEventListener("click", () => {
      const el = document.createElement("p");
      pickrContainerPrimary.appendChild(el);

      /* Delete previous instance */
      if (nanoPickr) {
        nanoPickr.destroyAndRemove();
      }

      /* Apply active class */
      for (const btn of nanoButtons) {
        btn.classList[btn === button ? "add" : "remove"]("active");
      }

      /* Create fresh instance */
      nanoPickr = new Pickr(
        Object.assign(
          {
            el,
            theme,
            default: "var(--color-primary)",
          },
          config
        )
      );

      /* Set events */
      nanoPickr.on("changestop", (source, instance) => {
        let color = instance.getColor().toRGBA();
        let html = document.querySelector("html");
       const toHex = (v) => v.toString(16).padStart(2, "0");

      let hexColor = `#${toHex(Math.floor(color[0]))}${toHex(
        Math.floor(color[1])
      )}${toHex(Math.floor(color[2]))}`;

      html.style.setProperty("--color-primary", hexColor);
        /* theme color picker */
        localStorage.setItem(
          "primaryRGB",
          hexColor
        );
        // updateColors();
      });

      
    });

    themeContainerPrimary.appendChild(button);
  }
  nanoButtons[0].click();
  /* for theme primary */

  /* for theme background */
  const nanoThemes1 = [
    [
      "nano",
      {
        defaultRepresentation: "RGB",
        components: {
          preview: true,
          opacity: false,
          hue: true,

          interaction: {
            hex: false,
            rgba: true,
            hsva: false,
            input: true,
            clear: false,
            save: false,
          },
        },
      },
    ],
  ];
  const nanoButtons1 = [];
  let nanoPickr1 = null;
  for (const [theme, config] of nanoThemes) {
    const button = document.createElement("button");
    button.innerHTML = theme;
    nanoButtons1.push(button);

    button.addEventListener("click", () => {
      const el = document.createElement("p");
      pickrContainerBackground.appendChild(el);

      /* Delete previous instance */
      if (nanoPickr1) {
        nanoPickr1.destroyAndRemove();
      }

      /* Apply active class */
      for (const btn of nanoButtons) {
        btn.classList[btn === button ? "add" : "remove"]("active");
      }

      /* Create fresh instance */
      nanoPickr1 = new Pickr(
        Object.assign(
          {
            el,
            theme,
            default: "var(--color-primary)",
          },
          config
        )
      );

      /* Set events */
        nanoPickr1.on("changestop", (source, instance) => {
        const [rF, gF, bF] = instance.getColor().toRGBA(); // [r, g, b, a]
        const clamp255 = n => Math.max(0, Math.min(255, Math.round(n)));
        const r = clamp255(rF), g = clamp255(gF), b = clamp255(bF);

        const r2 = clamp255(r + 14), g2 = clamp255(g + 14), b2 = clamp255(b + 14);

        const root = document.documentElement; // :root

        // If your CSS uses: background: var(--color-bodybg);
        root.style.setProperty("--color-bodybg", `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty("--color-bodybg2", `rgb(${r2}, ${g2}, ${b2})`);
        root.style.setProperty("--color-customwhite", `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty("--color-customblack", `rgb(${r2}, ${g2}, ${b2})`);
        root.style.setProperty("--color-dark", `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty("--color-light", `rgb(${r2}, ${g2}, ${b2})`);
        root.style.setProperty("--color-formcontrolbg", `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty("--gray-3", `rgb(${r2}, ${g2}, ${b2})`);

        // If your CSS uses: background: rgb(var(--color-bodybg-rgb));
        root.style.setProperty("--color-bodybg-rgb", `${r}, ${g}, ${b}`);
        root.style.setProperty("--color-bodybg2-rgb", `${r2}, ${g2}, ${b2}`);

        // housekeeping (unchanged)
        localStorage.removeItem("bgtheme");
        root.setAttribute("class", "dark");
        root.setAttribute("data-menu-styles", "dark");
        root.setAttribute("data-header-styles", "dark");

        const menuDark = document.querySelector("#switcher-menu-dark");
        const headerDark = document.querySelector("#switcher-header-dark");
        const themeDark = document.querySelector("#switcher-dark-theme");
        if (menuDark) menuDark.checked = true;
        if (headerDark) headerDark.checked = true;
        if (themeDark) themeDark.checked = true;

        localStorage.setItem("bodyBgRGB", `rgb(${r}, ${g}, ${b})`);
        localStorage.setItem("bodylightRGB", `rgb(${r2}, ${g2}, ${b2})`);
      });
    });
    themeContainerBackground.appendChild(button);
  }
  nanoButtons1[0].click();
  /* for theme background */

  /* header theme toggle */
  let html = document.querySelector("html");

  /* Choices JS */
  document.addEventListener("DOMContentLoaded", function () {
    var genericExamples = document.querySelectorAll("[data-trigger]");
    for (let i = 0; i < genericExamples.length; ++i) {
      var element = genericExamples[i];
      new Choices(element, {
        allowHTML: true,
        placeholderValue: "Search",
        searchPlaceholderValue: "Search",
      });
    }
  });
  /* Choices JS */

  /* footer year */
  document.getElementById("year").innerHTML = new Date().getFullYear();
  /* footer year */

  /* node waves */
  Waves.attach(".btn-wave", ["waves-light"]);
  Waves.init();
  /* node waves */

  /* card with close button */
  let BOX = ".box";
  let box = document.querySelectorAll(
    '[data-bs-toggle="box-remove"]'
  );
  box.forEach((ele) => {
    ele.addEventListener("click", function (e) {
      e.preventDefault();
      let $this = this;
      let box = $this.closest(BOX);
      box.remove();
      return false;
    });
  });
  /* card with close button */

  /* card with fullscreen */
  let boxFullscreenBtn = document.querySelectorAll(
    '[data-bs-toggle="box-fullscreen"]'
  );
  boxFullscreenBtn.forEach((ele) => {
    ele.addEventListener("click", function (e) {
      let $this = this;
      let box = $this.closest(DIV_BOX);
      box.classList.toggle("box-fullscreen");
      box.classList.remove("box-collapsed");
      e.preventDefault();
      return false;
    });
  });
  /* card with fullscreen */

  /* count-up */
  var i = 1;
  setInterval(() => {
    document.querySelectorAll(".count-up").forEach((ele) => {
      if (ele.getAttribute("data-count") >= i) {
        i = i + 1;
        ele.innerText = i;
      }
    });
  }, 10);
  /* count-up */

  window.addEventListener('scroll', () => {
    var windowScroll = document.body.scrollTop || document.documentElement.scrollTop,
        height = document.documentElement.scrollHeight - document.documentElement.clientHeight,
        scrollAmount = (windowScroll / height) * 100;

    const progressBar = document.querySelector(".progress-top-bar");
    if (progressBar) {
        progressBar.style.width = scrollAmount + "%";
    }
});

  /* Progressbar Top */

  /* back to top */
const scrollToTop = document.querySelector(".scrollToTop");
const $rootElement = document.documentElement;
const $body = document.body;

window.onscroll = () => {
  const scrollTop = window.scrollY || window.pageYOffset;
  const clientHt = $rootElement.scrollHeight - $rootElement.clientHeight;
  if (window.scrollY > 100) {
    scrollToTop.style.display = "flex";
  } else {
    scrollToTop.style.display = "none";
  }
};

scrollToTop.onclick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    scrollToTop.innerHTML = '<i class="ti ti-arrow-big-up text-[18px]"></i>';
};
  /* back to top */

})();

/* full screen */
var elem = document.documentElement;
function openFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    requestFullscreen();
  } else {
    exitFullscreen();
  }
}
function requestFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}
// Listen for fullscreen change event
document.addEventListener("fullscreenchange", handleFullscreenChange);
function handleFullscreenChange() {
  
  let open = document.querySelector(".full-screen-open");
  let close = document.querySelector(".full-screen-close");

  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    // Update icon for fullscreen mode
    close.classList.add("block");
    close.classList.remove("hidden");
    open.classList.add("hidden");
  } else {
    // Update icon for non-fullscreen mode
    close.classList.remove("block");
    open.classList.remove("hidden");
    close.classList.add("hidden");
    open.classList.add("block");
  }
}
/* full screen */

/* toggle switches */
let customSwitch = document.querySelectorAll(".toggle");
customSwitch.forEach((e) =>
  e.addEventListener("click", () => {
    e.classList.toggle("on");
  })
);
/* toggle switches */

/* header dropdown close button */

/* for cart dropdown */
const headerbtn = document.querySelectorAll(".dropdown-item-close");
headerbtn.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.parentNode.parentNode.parentNode.parentNode.parentNode.remove();
    document.getElementById("cart-data").innerText = `${document.querySelectorAll(".dropdown-item-close").length
      } `;
    document.getElementById("cart-icon-badge").innerText = `${document.querySelectorAll(".dropdown-item-close").length
      }`;
    console.log(
      document.getElementById("header-cart-items-scroll").children.length
    );
    if (document.querySelectorAll(".dropdown-item-close").length == 0) {
      let elementHide = document.querySelector(".empty-header-item");
      let elementShow = document.querySelector(".empty-item");
      elementHide.classList.add("hidden");
      elementShow.classList.remove("hidden");
    }
  });
});
/* for cart dropdown */

/* for notifications dropdown */
const headerbtn1 = document.querySelectorAll(".dropdown-item-close1");
headerbtn1.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.parentNode.parentNode.parentNode.parentNode.remove();
    document.getElementById("notifiation-data").innerText = `${document.querySelectorAll(".dropdown-item-close1").length
      } Unread`;
    if (document.querySelectorAll(".dropdown-item-close1").length == 0) {
      let elementHide1 = document.querySelector(".empty-header-item1");
      let elementShow1 = document.querySelector(".empty-item1");
      elementHide1.classList.add("hidden");
      elementShow1.classList.remove("hidden");
    }
  });
});
/* for notifications dropdown */

/* for cart items quantity */
var value = 1,
  minValue = 0,
  maxValue = 30;

let productMinusBtn = document.querySelectorAll(".product-quantity-minus")
let productPlusBtn = document.querySelectorAll(".product-quantity-plus")
productMinusBtn.forEach((element) => {
  element.onclick = () => {
    value = Number(element.parentElement.childNodes[3].value)
    if (value > minValue) {
      value = Number(element.parentElement.childNodes[3].value) - 1;
      element.parentElement.childNodes[3].value = value;
    }
  }
})
productPlusBtn.forEach((element) => {
  element.onclick = () => {
    if (value < maxValue) {
      value = Number(element.parentElement.childNodes[3].value) + 1;
      element.parentElement.childNodes[3].value = value;
    }
  }
})
/* for cart items quantity */



/* Search Keyboard Code */

const SEARCH_ITEMS = [
  { icon: "ri-dashboard-2-line", label: "Dashboard", desc: "Overview and stats", category: "Pages", url: "index.html" },
  { icon: "ri-profile-line", label: "Profile", desc: "Edit your account details", category: "Pages", url: "profile.html" },
  { icon: "ri-settings-2-line", label: "Settings", desc: "Alerts and preferences", category: "Pages", url: "profile-settings.html" },
  { icon: "ri-shopping-basket-line", label: "Cart", desc: "Plans, invoices, payments", category: "Pages", url: "cart.html" },
  { icon: "ri-group-line", label: "Team Members", desc: "Invite and manage your team", category: "Pages", url: "team.html" },
  { icon: "ri-key-2-line", label: "API Keys", desc: "Manage access tokens", category: "Settings", url: "javascript:void(0);" },
  { icon: "ri-plug-line", label: "Integrations", desc: "Connect third-party apps", category: "Settings", url: "javascript:void(0);" },
  { icon: "ri-shield-keyhole-line", label: "Security", desc: "2FA and session management", category: "Settings", url: "javascript:void(0);" },
  { icon: "ri-bar-chart-box-line", label: "Analytics", desc: "Usage reports and metrics", category: "Reports", url: "index-1.html" },
  { icon: "ri-file-text-line", label: "Documentation", desc: "Guides and API references", category: "Help", url: "javascript:void(0);" }
];

let activeIndex = 0;
let filteredItems = [];

/* Open Modal */
function openSearchModal() {
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("searchInput");

  if (!overlay || !input) return;

  overlay.classList.add("show");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
      input.value = "";
      input.focus();
      renderResults("");
  }, 50);
}

/* Close Modal */
function closeSearchModal() {
  const overlay = document.getElementById("searchOverlay");

  if (!overlay) return;

  overlay.classList.remove("show");
  document.body.style.overflow = "";
  activeIndex = 0;
}

/* Required because your HTML uses onclick="handleOverlayClick(event)" */
function handleOverlayClick(event) {
  if (event.target.id === "searchOverlay") {
      closeSearchModal();
  }
}

/* Search Button Click */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".responsive-search").forEach((btn) => {
      btn.addEventListener("click", function (e) {
          e.preventDefault();
          openSearchModal();
      });
  });
});

/* Keyboard Shortcut */
document.addEventListener("keydown", function (e) {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

  const isSearchShortcut = isMac
      ? e.metaKey && e.key.toLowerCase() === "k"
      : e.ctrlKey && e.key.toLowerCase() === "k";

  if (isSearchShortcut) {
      e.preventDefault();

      const overlay = document.getElementById("searchOverlay");

      if (overlay && overlay.classList.contains("show")) {
          closeSearchModal();
      } else {
          openSearchModal();
      }
  }

  if (e.key === "Escape") {
      closeSearchModal();
  }
});

/* Input Search */
function onSearchInput(query) {
  activeIndex = 0;
  renderResults(query);
}

/* Keyboard Navigation */
function onSearchKey(e) {
  if (!filteredItems.length) return;

  if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filteredItems.length - 1);
      renderResults(document.getElementById("searchInput").value);
      scrollActiveIntoView();
  }

  if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderResults(document.getElementById("searchInput").value);
      scrollActiveIntoView();
  }

  if (e.key === "Enter") {
      e.preventDefault();

      const item = filteredItems[activeIndex];

      if (item && item.url) {
          window.location.href = item.url;
      }
  }

  if (e.key === "Escape") {
      closeSearchModal();
  }
}

/* Scroll Active Result */
function scrollActiveIntoView() {
  const el = document.querySelector(".sm-item.active");

  if (el) {
      el.scrollIntoView({ block: "nearest" });
  }
}

/* Render Results */
function renderResults(query) {
  const q = query.trim().toLowerCase();
  const container = document.getElementById("searchResults");
  const countEl = document.getElementById("resultCount");

  if (!container || !countEl) return;

  filteredItems = q
      ? SEARCH_ITEMS.filter((item) =>
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
      : [...SEARCH_ITEMS];

  if (!filteredItems.length) {
      countEl.textContent = "";
      container.innerHTML = `
          <div class="sm-empty">
              <i class="ri-search-line"></i>
              No results for "<strong>${escapeHtml(query)}</strong>"
          </div>
      `;
      return;
  }

  countEl.textContent = filteredItems.length + " result" + (filteredItems.length !== 1 ? "s" : "");

  const groups = {};

  filteredItems.forEach((item) => {
      if (!groups[item.category]) {
          groups[item.category] = [];
      }

      groups[item.category].push(item);
  });

  let html = "";

  Object.entries(groups).forEach(([category, items]) => {
      html += `<div class="sm-category">${escapeHtml(category)}</div>`;

      items.forEach((item) => {
          const idx = filteredItems.indexOf(item);
          const isActive = idx === activeIndex;

          html += `
              <a class="sm-item ${isActive ? "active" : ""}"
                 href="${escapeHtml(item.url)}"
                 role="option"
                 aria-selected="${isActive}"
                 onmouseenter="setActive(${idx})">
                  <div class="sm-icon">
                      <i class="ri ${escapeHtml(item.icon)}"></i>
                  </div>
                  <div>
                      <div class="sm-label">${highlight(escapeHtml(item.label), query)}</div>
                      <div class="sm-desc">${highlight(escapeHtml(item.desc), query)}</div>
                  </div>
                  <i class="ri ri-arrow-right-line sm-arrow"></i>
              </a>
          `;
      });
  });

  container.innerHTML = html;
}

/* Mouse Active */
function setActive(idx) {
  activeIndex = idx;

  document.querySelectorAll(".sm-item").forEach((item, index) => {
      item.classList.toggle("active", index === idx);
  });
}

/* Highlight Keyword */
function highlight(text, query) {
  if (!query) return text;

  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return text.replace(new RegExp(`(${safe})`, "gi"), "<mark>$1</mark>");
}

/* Escape HTML */
function escapeHtml(str) {
  return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}

/* Search Keyboard Code */

const overlay = document.getElementById("searchOverlay");
const modal = document.getElementById("searchModal");
const closeBtn = overlay.querySelector("[data-hs-overlay='#searchOverlay']");

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
        closeBtn.click();
    }
});

modal.addEventListener("click", (e) => {
    e.stopPropagation();
});

/* Notification */


const AVATAR_COLORS = [
  { bg: '#eef2ff', text: '#4f46e5' },
  { bg: '#fdf2f8', text: '#be185d' },
  { bg: '#ecfdf5', text: '#059669' },
  { bg: '#fff7ed', text: '#c2410c' },
  { bg: '#eff6ff', text: '#1d4ed8' },
  { bg: '#faf5ff', text: '#7c3aed' },
  { bg: '#fff1f2', text: '#be123c' },
  { bg: '#f0fdfa', text: '#0f766e' },
];

function colorFor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

let notifications = [
  { id: 1, name: 'Isaiah Rivera',action: 'has registered',time: '2min ago',read: false,avatar: '../assets/images/faces/1.jpg'  },
  { id: 2, name: 'Samuel Young',action: 'has registered',time: '20min ago',read: true,avatar: '../assets/images/faces/2.jpg'  },
  { id: 3, name: 'Christian Brooks',action: 'request for KYC verifications',time: '1hr ago',read: true,avatar: null },
  { id: 4, name: 'Levi Collins',action: 'has registered',time: '2hr ago',read: false,avatar: '../assets/images/faces/3.jpg'  },
  { id: 5, name: 'Brayden Stewart',action: 'has registered',time: '4min ago',read: true,avatar: null },
  { id: 6, name: 'Isabella Anderson',action: 'has registered',time: 'Tuesday',read: false,avatar: '../assets/images/faces/4.jpg'},
  { id: 7, name: 'John Cook',action: 'has registered',time: 'Last week',read: true,avatar: '../assets/images/faces/5.jpg'  },
];

let nextId = 30;
let nameIdx = 0;

const LIVE_NAMES = [
  'Emma Wilson','Lucas Patel','Sofia Chen','Noah Kim',
  'Mia Johnson','Ethan Brown','Ava Martinez','Liam Davis',
  'Chloe Scott','James Lee','Hannah White','Ryan Carter',
];
const LIVE_ACTIONS = [
  'has registered',
  'request for KYC verifications',
  'updated their profile',
  'completed onboarding',
  'submitted a document',
];

function buildAvatar(n) {
  const c = colorFor(n.name);
  if (n.avatar) {
    return `<div class="notify-avatar">
      <img class="avatar avtar-sm avatar-rounded" src="${n.avatar}" alt="${n.name}" onerror="this.parentElement.innerHTML='<span style=color:${c.text};font-size:13px;font-weight:600;>${initials(n.name)}</span>';this.parentElement.style.background='${c.bg}';"
      />
    </div>`;
  }
  return `<div class="notify-avatar avatar avtar-sm avatar-rounded" style="background:${c.bg}; color:${c.text};">${initials(n.name)}</div>`;
}

function buildItem(n) {
  return `
    <li class="notify-item${n.read ? '' : ' unread'}${n.fresh ? ' fresh' : ''}" onclick="markRead(${n.id})">
      ${buildAvatar(n)}
      <div class="notify-body grow">
        <div class="notify-text"><strong>${n.name}</strong> ${n.action}</div>
        <div class="notify-time">${n.time}</div>
      </div>
      ${!n.read ? '<div class="unread-dot"></div>' : '<div class="dot-spacer"></div>'}
    </li>`;
}

const emptyHTML = `
  <div class="notify-empty">
    <svg class="mx-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-ring-icon lucide-bell-ring"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M22 8c0-2.3-.8-4.3-2-6"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/></svg>
    <p>No notifications</p>
  </div>`;

function render() {
  const all    = notifications;
  const unread = notifications.filter(n => !n.read);

  document.getElementById('list-all').innerHTML =
    all.length ? all.map(buildItem).join('') : emptyHTML;


  document.getElementById('list-unread').innerHTML =
    unread.length ? unread.map(buildItem).join('') : emptyHTML;

  const uc = unread.length;
  document.getElementById('unread-badge').textContent = uc > 9 ? '9+' : uc;
}

function markRead(id) {
  const n = notifications.find(x => x.id === id);
  if (!n || n.read) return;
  n.read = true;

  // Update the dot in both lists for this specific item
  document.querySelectorAll(`.notify-item[onclick="markRead(${id})"]`).forEach(el => {
    el.classList.remove('unread');
    const dot = el.querySelector('.unread-dot');
    if (dot) {
      dot.className = 'dot-spacer';
    }

    // Remove from unread list
    const pane = el.closest('#list-unread');
    if (pane) {
      el.remove();
      if (!pane.querySelector('.notify-item')) {
        pane.innerHTML = emptyHTML;
      }
      
    }
  });

  // Update unread badge
  const uc = notifications.filter(n => !n.read).length;
  document.getElementById('unread-badge').textContent = uc > 9 ? '9+' : uc;
}

function markAllRead() {
  notifications.forEach(n => n.read = true);

  // Update all items in #list-all
  document.querySelectorAll('#list-all .notify-item').forEach(el => {
    el.classList.remove('unread');
    const dot = el.querySelector('.unread-dot');
    if (dot) dot.className = 'dot-spacer';
  });

  // Clear unread list and show empty state
  const listUnread = document.getElementById('list-unread');
  listUnread.innerHTML = emptyHTML;

  // Reset badge
  document.getElementById('unread-badge').textContent = '0';
}

const LIVE_AVATARS = [
  '../assets/images/faces/12.jpg',
  '../assets/images/faces/5.jpg',
  null,
  '../assets/images/faces/8.jpg',
  '../assets/images/faces/7.jpg',
  null,
  '../assets/images/faces/3.jpg',
  '../assets/images/faces/8.jpg',
  null,
  '../assets/images/faces/2.jpg',
  '../assets/images/faces/3.jpg',
  null,
];

function addLiveNotification() {
  const name   = LIVE_NAMES[nameIdx % LIVE_NAMES.length];
  const action = LIVE_ACTIONS[Math.floor(Math.random() * LIVE_ACTIONS.length)];
  const avatar = LIVE_AVATARS[nameIdx % LIVE_AVATARS.length];
  nameIdx++;
  const notif = { id: nextId++, name, action, time: 'just now', read: false, fresh: true, avatar };
  notifications.unshift(notif);

  // Append new item to the top of #list-all
  const listAll = document.getElementById('list-all');
  const tempAll = document.createElement('div');
  tempAll.innerHTML = buildItem(notif);
  const newItemAll = tempAll.firstElementChild;
  listAll.prepend(newItemAll);

  // Append new item to the top of #list-unread
  const listUnread = document.getElementById('list-unread');

  // Remove empty state if present
  const empty = listUnread.querySelector('.notify-empty');
  
  if (empty) {
    empty.remove();
  }

  const tempUnread = document.createElement('li');
  tempUnread.innerHTML = buildItem(notif);
  const newItemUnread = tempUnread.firstElementChild;
  listUnread.prepend(newItemUnread);

  // Remove animation class after it plays
  setTimeout(() => {
    newItemAll.classList.remove('fresh');
    newItemUnread.classList.remove('fresh');
    notif.fresh = false;
  }, 500);

  // Trim excess items from DOM if over limit
  if (notifications.length > 10) {
    notifications.pop();
    const allItems = listAll.querySelectorAll('.notify-item');
    if (allItems.length > 10) allItems[allItems.length - 1].remove();
    const unreadItems = listUnread.querySelectorAll('.notify-item');
    if (unreadItems.length > 10) unreadItems[unreadItems.length - 1].remove();
  }

  // Update unread badge count
  const uc = notifications.filter(n => !n.read).length;
  document.getElementById('unread-badge').textContent = uc > 9 ? '9+' : uc;
}

render();
setInterval(addLiveNotification, 5000);
/* Notification */
