// window.addEventListener("load", () => {
//   const themeBtn = document.querySelectorAll("[data-hs-theme-click-value]");
//   let html = document.querySelector("html");

//   themeBtn.forEach(($item) => {
//     $item.addEventListener("click", () => {
//       if (html.classList.contains("dark")) {
//         html.classList.remove("dark");
//         html.style.removeProperty("--color-light");
//         html.style.removeProperty("--color-customblack");
//         html.style.removeProperty("--input-border");
//         html.style.removeProperty("--gray-3");
//         html.style.removeProperty("--color-customwhite");
//         html.style.removeProperty('--color-bodybg2');
//         localStorage.removeItem("layout-theme");
//         localStorage.removeItem("nilovadarktheme");
//         localStorage.removeItem("nilovaMenu");
//         localStorage.removeItem("nilovaHeader");
//         localStorage.removeItem("darkBgRGB");
//         localStorage.removeItem("bodyBgRGB");
//         localStorage.removeItem("bodylightRGB");
//         html.setAttribute("data-menu-styles", "transparent");
//         html.setAttribute("data-header-styles", "transparent");
//         document.getElementById("switcher-menu-transparent").checked = true;
//         document.getElementById("switcher-header-transparent").checked = true;
//         document.getElementById("switcher-light-theme").checked = true;
//         html.style.removeProperty("--color-dark");
//         html.style.removeProperty('--color-bodybg2');
//         localStorage.removeItem("bodyBgRGB");
//         localStorage.removeItem("bodylightRGB");
//         html.style.removeProperty('--color-bodybg');
//         html.style.removeProperty("--color-bodybg2");
//         html.style.removeProperty("--color-formcontrolbg");
//         html.style.removeProperty("--inputborder"); 
//         document.querySelector("#switcher-background4").checked = false
//         document.querySelector("#switcher-background3").checked = false
//         document.querySelector("#switcher-background2").checked = false
//         document.querySelector("#switcher-background1").checked = false
//         document.querySelector("#switcher-background").checked = false 
//         localStorage.removeItem("hs_theme");
//         if(localStorage.getItem("nilovalayout") == "horizontal"){
//           html.setAttribute('data-menu-styles', 'transparent');
//         }
//         if (document.querySelector("#hs-overlay-switcher")) {
//           document.getElementById("switcher-light-theme").checked = true;
//         }
//       } else {
//         if (document.querySelector("#hs-overlay-switcher")) {
//           document.getElementById("switcher-dark-theme").checked = true;
//         }
//         html.setAttribute("class", "dark");
//         html.style.removeProperty("--color-light");
//         html.style.removeProperty('--color-bodybg2');
//         document.querySelector('html').style.removeProperty('--color-bodybg2');
//         html.style.removeProperty("--color-formcontrolbg");
//         html.style.removeProperty("--color-inputborder");
//         html.style.removeProperty('--color-bodybg');
//         html.style.removeProperty('--color-bodybg2');
//         html.style.removeProperty('--color-bodybg2');
//         localStorage.setItem("layout-theme", "dark");
//         html.setAttribute("data-header-styles", "transparent");
//         html.setAttribute("data-menu-styles", "transparent");
//         document.getElementById("switcher-menu-transparent").checked = true;
//         document.getElementById("switcher-header-transparent").checked = true;
//         document.getElementById("switcher-dark-theme").checked = true;
//         localStorage.removeItem("nilovaMenu");
//         localStorage.removeItem("nilovaHeader");
//         localStorage.setItem("nilovadarktheme", true);
//         localStorage.removeItem("nilovalighttheme");
//         localStorage.removeItem("bodyBgRGB");
//         localStorage.removeItem("bodylightRGB");
//         localStorage.setItem("nilovaMenu", "transparent");
//         localStorage.setItem("nilovaHeader", "transparent");
//         localStorage.removeItem("hs_theme");
//         html.style.removeProperty("--color-bodybg2");
//         document.querySelector("#switcher-background4").checked = false
//         document.querySelector("#switcher-background3").checked = false
//         document.querySelector("#switcher-background2").checked = false
//         document.querySelector("#switcher-background1").checked = false
//         document.querySelector("#switcher-background").checked = false
//       }
//     });
//   });
// });


// window.addEventListener("load", () => {
//   const themeBtn = document.querySelectorAll("[data-hs-theme-click-value]");
//   const html = document.documentElement;

//   // remember initial data-toggled (if any)
//   const initialToggled = html.getAttribute("data-toggled") || null;

//   themeBtn.forEach(($item) => {
//     $item.addEventListener("click", () => {
//       // === LIGHT MODE ===
//       if (html.classList.contains("dark")) {
//         html.classList.remove("dark");

//         // restore original data-toggled state if you want it same for both themes
//         if (initialToggled) {
//           html.setAttribute("data-toggled", initialToggled);
//         } else {
//           html.removeAttribute("data-toggled");
//         }

//         html.style.removeProperty("--color-light");
//         html.style.removeProperty("--color-customblack");
//         html.style.removeProperty("--input-border");
//         html.style.removeProperty("--gray-3");
//         html.style.removeProperty("--color-customwhite");
//         html.style.removeProperty("--color-bodybg2");
//         html.style.removeProperty("--color-dark");
//         html.style.removeProperty("--color-bodybg");
//         html.style.removeProperty("--color-formcontrolbg");
//         html.style.removeProperty("--inputborder");

//         // localStorage.removeItem("layout-theme");
//         localStorage.removeItem("nilovadarktheme");
//         localStorage.removeItem("nilovaMenu");
//         localStorage.removeItem("nilovaHeader");
//         localStorage.removeItem("darkBgRGB");
//         localStorage.removeItem("bodyBgRGB");
//         localStorage.removeItem("bodylightRGB");
//         localStorage.removeItem("hs_theme");

//         html.setAttribute("data-menu-styles", "transparent");
//         html.setAttribute("data-header-styles", "transparent");

//         document.getElementById("switcher-menu-transparent").checked = true;
//         document.getElementById("switcher-header-transparent").checked = true;
//         document.getElementById("switcher-light-theme").checked = true;

//         document.querySelector("#switcher-background4").checked = false;
//         document.querySelector("#switcher-background3").checked = false;
//         document.querySelector("#switcher-background2").checked = false;
//         document.querySelector("#switcher-background1").checked = false;
//         document.querySelector("#switcher-background").checked = false;

//         if (localStorage.getItem("nilovalayout") === "horizontal") {
//           html.setAttribute("data-menu-styles", "transparent");
//         }

//         if (document.querySelector("#hs-overlay-switcher")) {
//           document.getElementById("switcher-light-theme").checked = true;
//         }

//       // === DARK MODE ===
//       } else {
//         if (document.querySelector("#hs-overlay-switcher")) {
//           document.getElementById("switcher-dark-theme").checked = true;
//         }

//         html.classList.add("dark"); // ✅ instead of setAttribute("class", "dark")

//         // keep same data-toggled as initial, or set explicitly if you always want double-menu-open
//         // if (initialToggled) {
//         //   html.setAttribute("data-toggled", initialToggled);
//         // }
//         // OR if you *always* want double-menu-open in dark:
//         // html.setAttribute("data-toggled", "double-menu-open");

//         html.style.removeProperty("--color-light");
//         html.style.removeProperty("--color-formcontrolbg");
//         html.style.removeProperty("--color-inputborder");
//         html.style.removeProperty("--color-bodybg");
//         html.style.removeProperty("--color-bodybg2");

//         // localStorage.setItem("layout-theme", "dark");
//         localStorage.setItem("nilovadarktheme", true);
//         localStorage.removeItem("nilovalighttheme");
//         localStorage.removeItem("nilovaMenu");
//         localStorage.removeItem("nilovaHeader");
//         localStorage.removeItem("bodyBgRGB");
//         localStorage.removeItem("bodylightRGB");
//         localStorage.removeItem("hs_theme");

//         html.setAttribute("data-header-styles", "transparent");
//         html.setAttribute("data-menu-styles", "transparent");
//         localStorage.setItem("nilovaMenu", "transparent");
//         localStorage.setItem("nilovaHeader", "transparent");

//         document.getElementById("switcher-menu-transparent").checked = true;
//         document.getElementById("switcher-header-transparent").checked = true;
//         document.getElementById("switcher-dark-theme").checked = true;

//         document.querySelector("#switcher-background4").checked = false;
//         document.querySelector("#switcher-background3").checked = false;
//         document.querySelector("#switcher-background2").checked = false;
//         document.querySelector("#switcher-background1").checked = false;
//         document.querySelector("#switcher-background").checked = false;
//       }
//     });
//   });
// });
