"use strict";

/* Choices JS */
document.addEventListener("DOMContentLoaded", function () {
  var genericExamples = document.querySelectorAll("[data-trigger]");
  for (let i = 0; i < genericExamples.length; ++i) {
    var element = genericExamples[i];
    new Choices(element, {
      allowHTML: true,
      placeholderValue: "This is a placeholder set in the config",
      searchPlaceholderValue: "Search",
    });
  }
});
/* Choices JS */

/*------swipter-js-----*/

//switcher color pickers
const pickrContainerPrimary = document.querySelector(
  ".pickr-container-primary"
);
const themeContainerPrimary = document.querySelector(
  ".theme-container-primary"
);
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
          `${Math.floor(color[0])}, ${Math.floor(color[1])}, ${Math.floor(
            color[2]
          )}`
        );
        // updateColors();
      });

      
    });

    themeContainerPrimary.appendChild(button);
  }
  nanoButtons[0].click();
  /* for theme primary */

let mainContent;
(function () {
  let html = document.querySelector("html");
  mainContent = document.querySelector(".main-content");

  localStorageBackup();
  switcherClick();
  checkOptions();
  /* LTR to RTL */
  // html.setAttribute("dir" , "rtl") // for rtl version
})();

function switcherClick() {
  let ltrBtn,
    rtlBtn,
    lightBtn,
    darkBtn,
    primaryDefaultColor1Btn,
    primaryDefaultColor2Btn,
    primaryDefaultColor3Btn,
    primaryDefaultColor4Btn,
    primaryDefaultColor5Btn,
    ResetAll;
  let html = document.querySelector("html");
  lightBtn = document.querySelector("#switcher-light-theme");
  darkBtn = document.querySelector("#switcher-dark-theme");
  ltrBtn = document.querySelector("#switcher-ltr");
  rtlBtn = document.querySelector("#switcher-rtl");
  primaryDefaultColor1Btn = document.querySelector("#switcher-primary");
  primaryDefaultColor2Btn = document.querySelector("#switcher-primary1");
  primaryDefaultColor3Btn = document.querySelector("#switcher-primary2");
  primaryDefaultColor4Btn = document.querySelector("#switcher-primary3");
  primaryDefaultColor5Btn = document.querySelector("#switcher-primary4");
  ResetAll = document.querySelector("#reset-all");

  /* Light Layout Start */
  let lightThemeVar = lightBtn.addEventListener("click", () => {
    lightFn();
    localStorage.setItem("nilovaHeader", "light");
    localStorage.setItem("nilovaMenu", "light");
  });
  /* Light Layout End */

  /* Dark Layout Start */
  let darkThemeVar = darkBtn.addEventListener("click", () => {
    darkFn();
    localStorage.setItem("nilovaMenu", "dark");
    localStorage.setItem("nilovaHeader", "dark");
  });
  /* Dark Layout End */

  // primary theme
  let primaryColor1Var = primaryDefaultColor1Btn.addEventListener(
    "click",
    () => {
      localStorage.setItem("primaryRGB", "#4b52ba");
      html.style.setProperty("--color-primary", `#4b52ba`);
      updateColors();
    }
  );
  if (localStorage.primaryRGB == "#4b52ba") {
    document.querySelector('#switcher-primary').checked = true;
  }
  let primaryColor2Var = primaryDefaultColor2Btn.addEventListener(
    "click",
    () => {
      localStorage.setItem("primaryRGB", "#943ba3");
      html.style.setProperty("--color-primary", `#943ba3`);
      updateColors();
    }
  );
  if (localStorage.primaryRGB == "#943ba3") {
    document.querySelector('#switcher-primary1').checked = true;
  }
  let primaryColor3Var = primaryDefaultColor3Btn.addEventListener(
    "click",
    () => {
      localStorage.setItem("primaryRGB", "#35717d");
      html.style.setProperty("--color-primary", `#35717d`);
      updateColors();
    }
  );
  if (localStorage.primaryRGB == "#35717d") {
    document.querySelector('#switcher-primary2').checked = true;
  }
  let primaryColor4Var = primaryDefaultColor4Btn.addEventListener(
    "click",
    () => {
      localStorage.setItem("primaryRGB", "#9e783b");
      html.style.setProperty("--color-primary", `#9e783b`);
      updateColors();
    }
  );
  if (localStorage.primaryRGB == "#9e783b") {
    document.querySelector('#switcher-primary3').checked = true;
  }
  let primaryColor5Var = primaryDefaultColor5Btn.addEventListener(
    "click",
    () => {
      localStorage.setItem("primaryRGB", "#728026");
      html.style.setProperty("--color-primary", `#728026`);
      updateColors();
    }
  );
  if (localStorage.primaryRGB == "#728026") {
    document.querySelector('#switcher-primary4').checked = true;
  }

  /* rtl start */
  let rtlVar = rtlBtn.addEventListener("click", () => {
    localStorage.setItem("nilovartl", true);
    localStorage.removeItem("nilovaltr");
    rtlFn();
  });
  /* rtl end */

  /* ltr start */
  let ltrVar = ltrBtn.addEventListener("click", () => {
    //    local storage
    localStorage.setItem("nilovaltr", true);
    localStorage.removeItem("nilovartl");
    ltrFn();
  });
  /* ltr end */

  // reset all start
  let resetVar = ResetAll.addEventListener("click", () => {
    // clear primary & bg color
    html.style.removeProperty(`--color-primary`);

    // clear rtl
    html.removeAttribute("dir", "rtl");
    html.setAttribute("dir", "ltr");

    ResetAllFn();
  });
  // reset all start
}

function ltrFn() {
  let html = document.querySelector("html");
  html.setAttribute("dir", "ltr");
  document.querySelector("#switcher-ltr").checked = true;
  checkOptions();
}

function rtlFn() {
  let html = document.querySelector("html");
  html.setAttribute("dir", "rtl");
  checkOptions();
}

if (localStorage.nilovartl) {
  rtlFn();
}

function lightFn() {
  let html = document.querySelector("html");
  html.setAttribute("class", "light");
  document.querySelector("#switcher-light-theme").checked = true;
  updateColors();
  localStorage.removeItem("nilovadarktheme");
  checkOptions();
  // html.style.removeProperty('--color-primary');
}

function darkFn() {
  let html = document.querySelector("html");
  html.setAttribute("class", "dark");
  updateColors();
  localStorage.setItem("nilovadarktheme", true);
  localStorage.removeItem("nilovalighttheme");
  checkOptions();
  // html.style.removeProperty("--color-primary");
}

function ResetAllFn() {
  let html = document.querySelector("html");
  checkOptions();

  // clearing localstorage
  localStorage.clear();

  // reseting chart colors
  updateColors();

  // reseting rtl
  ltrFn();

  // reseting dark theme
  lightFn();

  // resetting theme primary
  document.querySelector("#switcher-primary").checked = false
  document.querySelector("#switcher-primary1").checked = false
  document.querySelector("#switcher-primary2").checked = false
  document.querySelector("#switcher-primary3").checked = false
  document.querySelector("#switcher-primary4").checked = false
}

function checkOptions() {
  // dark
  if (localStorage.getItem("nilovadarktheme")) {
    document.querySelector("#switcher-dark-theme").checked = true;
  }

  //RTL
  if (localStorage.getItem("nilovartl")) {
    document.querySelector("#switcher-rtl").checked = true;
  }
}

// chart colors
let myVarVal, primaryRGB;
function updateColors() {
  "use strict";
  primaryRGB = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-primary")
    .trim();
}
updateColors();

function localStorageBackup() {
  if (localStorage.primaryRGB) {
    if (document.querySelector(".theme-container-primary")) {
      document.querySelector(".theme-container-primary").value =
        localStorage.primaryRGB;
    }
    document
      .querySelector("html")
      .style.setProperty("--color-primary", localStorage.primaryRGB);
  }
  if (localStorage.nilovadarktheme) {
    let html = document.querySelector("html");
    html.setAttribute("class", "dark");
  }

  if (localStorage.nilovartl) {
    let html = document.querySelector("html");
    html.setAttribute("dir", "rtl");
  }
  if (localStorage.nilovalayout) {
    let html = document.querySelector("html");
    let layoutValue = localStorage.getItem("nilovalayout");
    html.setAttribute("data-nav-layout", "horizontal");
  }
}
/*------swipter-js-----*/

/* footer year */
document.getElementById("year").innerHTML = new Date().getFullYear();
/* footer year */


// section menu active
// section menu active
function onScroll(event) {
  const sections = document.querySelectorAll(".side-menu__item");
  const scrollPos =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop;

  sections.forEach((elem) => {
    const val = elem.getAttribute("href");
    let refElement;
    if (val != "javascript:void(0);" && val !== "#") {
      refElement = document.querySelector(val);
    }
    const scrollTopMinus = scrollPos + 73;
    if (
      refElement?.offsetTop <= scrollTopMinus &&
      refElement?.offsetTop + refElement.offsetHeight > scrollTopMinus
    ) {
      if (elem.parentElement.parentElement.classList.contains("child1")) {
        elem.parentElement.parentElement.parentElement.children[0].classList.add(
          "active"
        );
      }
      elem.classList.add("active");
      if (elem.closest(".child1")?.previousElementSibling) {
        elem.closest(".child1").previousElementSibling.classList.add("active");
      }
    } else {
      elem.classList.remove("active");
    }
  });
}
window.document.addEventListener("scroll", onScroll);

// smooth scroll on menu click
document.querySelectorAll('.side-menu__item').forEach((link) => {
  link.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === 'javascript:void(0);' || href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetTop = target.offsetTop - 70; // adjust as needed
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

window.document.addEventListener("scroll", onScroll);
// for menu target scroll on click

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
    scrollToTop.textContent = "↑"; 
};
  /* back to top */

/* Trusted Clients Swiper */
var swiper = new Swiper(".trusted-clients", {
  loop: true,
  slidesPerView: 5,
  spaceBetween: 30,
  autoplay: {
    delay: 1500,
    disableOnInteraction: false,
  },
  breakpoints: {
    320: {
        slidesPerView: 1,
        spaceBetween: 5,
    },
    640: {
        slidesPerView: 1,
        spaceBetween: 5,
    },
    768: {
        slidesPerView: 3,
        spaceBetween: 5,
    },
    1024: {
        slidesPerView: 5,
        spaceBetween: 20,
    }
},
});
/* Trusted Clients Swiper */

/* testimonial swiper service start */
var swiper = new Swiper(".testimonialSwiperService", {
  slidesPerView: 2,
  spaceBetween: 30,
  loop: true,
  loopFillGroupWithBlank: true,
  pagination: {
    el: ".swiper-pagination",
    dynamicBullets: true,
    clickable: true,
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    480: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    1112: {
      slidesPerView: 2,
      spaceBetween: 10,
    },
    1300: {
      slidesPerView: 2,
      spaceBetween: 30,
    }
  },
});
/* testimonial swiper service start */
