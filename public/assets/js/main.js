(function () {
    'use strict';
    if (localStorage.getItem("nilovadarktheme")) {
        document.querySelector("html").setAttribute("class", "dark")
        document.querySelector("html").setAttribute("data-menu-styles", "dark")
        document.querySelector("html").setAttribute("data-header-styles", "transparent")
    }
    if (localStorage.nilovartl) {
        let html = document.querySelector('html');
        html.setAttribute("dir", "rtl");
    }
    if (localStorage.nilovalayout) {
        let html = document.querySelector('html');
        html.setAttribute("data-nav-layout", "horizontal");
        document.querySelector("html").setAttribute("data-menu-styles", "light")
    }
    if (localStorage.getItem("nilovalayout") == "horizontal") {
        document.querySelector("html").setAttribute("data-nav-layout", "horizontal")
    }
    if (localStorage.loaderEnable == 'true') {
        document.querySelector("html").setAttribute("loader", "enable");
    } else {
        if (!document.querySelector("html").getAttribute("loader")) {
            document.querySelector("html").setAttribute("loader", "disable");
        }
    }

    function localStorageBackup() {
        if (localStorage.primaryRGB) {
            document
                .querySelector("html")
                .style.setProperty("--color-primary", localStorage.primaryRGB1);
            document
                .querySelector("html")
                .style.setProperty("--color-primary", localStorage.primaryRGB);
        }
        if (localStorage.bodyBgRGB && localStorage.bodylightRGB) {
            document.querySelector("html").style.setProperty("--color-bodybg2", localStorage.bodylightRGB);
            document.querySelector("html").style.setProperty("--color-light", localStorage.bodylightRGB);
            document.querySelector("html").style.setProperty("--color-bodybg", localStorage.bodyBgRGB);
            document.querySelector("html").style.setProperty("--color-formcontrolbg", localStorage.bodyBgRGB);
            document.querySelector("html").style.setProperty("--color-dark", localStorage.bodyBgRGB);
           document.querySelector("html").style.setProperty("--color-customblack", localStorage.bodyBgRGB);
           document.querySelector("html").style.setProperty("--color-customwhite", localStorage.bodyBgRGB);
           document.querySelector('html').style.setProperty('--color-inputborder', "rgba(255,255,255,0.1)");
            document.querySelector('html').style.setProperty('--color-defaultborder', "rgba(255,255,255,0.1)");
            document.querySelector('html').style.setProperty('--color-headerbordercolor', "rgba(255,255,255,0.1)");
            document.querySelector('html').style.setProperty('--color-menubordercolor', "rgba(255,255,255,0.1)");
            let html = document.querySelector("html");
            html.classList.add("dark");
            html.classList.remove("light");
            html.setAttribute("data-menu-styles", "dark");
            html.setAttribute("data-header-styles", "transparent");
          }
        if (localStorage.nilovadarktheme) {
            let html = document.querySelector('html');
            html.setAttribute('class', 'dark');
        }
        if (localStorage.nilovalayout) {
            let html = document.querySelector('html');
            let layoutValue = localStorage.getItem('nilovalayout');
            html.setAttribute('data-nav-layout', 'horizontal');
            setTimeout(() => {
                clearNavDropdown();
            }, 5000);
            html.setAttribute('data-nav-style', 'menu-click');
            setTimeout(() => {
                checkHoriMenu();
            }, 5000);
        }
        if (localStorage.nilovaverticalstyles) {
            let html = document.querySelector('html');
            let verticalStyles = localStorage.getItem('nilovaverticalstyles');

            if (verticalStyles == 'default') {
                html.setAttribute('data-vertical-style', 'default');
                localStorage.removeItem("nilovanavstyles")
            }
            if (verticalStyles == 'closed') {
                html.setAttribute('data-vertical-style', 'closed');
                localStorage.removeItem("nilovanavstyles")
            }
            if (verticalStyles == 'icontext') {
                html.setAttribute('data-vertical-style', 'icontext');
                localStorage.removeItem("nilovanavstyles")
            }
            if (verticalStyles == 'overlay') {
                html.setAttribute('data-vertical-style', 'overlay');
                localStorage.removeItem("nilovanavstyles")
            }
            if (verticalStyles == 'detached') {
                html.setAttribute('data-vertical-style', 'detached');
                localStorage.removeItem("nilovanavstyles")
            }
            if (verticalStyles == 'doublemenu') {
                html.setAttribute('data-vertical-style', 'doublemenu');
                localStorage.removeItem("nilovanavstyles")
                // setTimeout(() => {

                //     const menuSlideItem = document.querySelectorAll(
                //         ".main-menu > li > .side-menu__item"
                //     );

                //     // Create the tooltip element
                //     const tooltip = document.createElement("div");
                //     tooltip.className = "custome-tooltip";
                //     // tooltip.textContent = "This is a tooltip";

                //     // Set the CSS properties of the tooltip element
                //     tooltip.style.setProperty("position", "fixed");
                //     tooltip.style.setProperty("display", "none");
                //     tooltip.style.setProperty("padding", "0.5rem");
                //     tooltip.style.setProperty("font-weight", "500");
                //     tooltip.style.setProperty("font-size", "0.75rem");
                //     tooltip.style.setProperty("background-color", "rgb(15, 23 ,42)");
                //     tooltip.style.setProperty("color", "rgb(255, 255 ,255)");
                //     tooltip.style.setProperty("margin-inline-start", "45px");
                //     tooltip.style.setProperty("border-radius", "0.25rem");
                //     tooltip.style.setProperty("z-index", "99");

                //     menuSlideItem.forEach((e) => {
                //         // Add an event listener to the menu slide item to show the tooltip
                //         e.addEventListener("mouseenter", () => {
                //             tooltip.style.setProperty("display", "block");
                //             tooltip.textContent =
                //                 e.querySelector(".side-menu__label").textContent;
                //             if (document.querySelector("html").getAttribute("data-vertical-style") == "doublemenu") {
                //                 e.appendChild(tooltip);
                //             }
                //         });

                //         // Add an event listener to hide the tooltip
                //         e.addEventListener("mouseleave", () => {
                //             tooltip.style.setProperty("display", "none");
                //             tooltip.textContent = e.querySelector(".side-menu__label").textContent;

                //         });
                //     });
                // }, 1000);
            }
        }
        if (localStorage.nilovanavstyles) {
            let html = document.querySelector('html');
            let navStyles = localStorage.getItem('nilovanavstyles');
            if (navStyles == 'menu-click') {
                html.setAttribute('data-nav-style', 'menu-click');
                localStorage.removeItem("nilovaverticalstyles");
                html.removeAttribute('data-vertical-style');
            }
            if (navStyles == 'menu-hover') {
                html.setAttribute('data-nav-style', 'menu-hover');
                localStorage.removeItem("nilovaverticalstyles");
                html.removeAttribute('data-vertical-style');
            }
            if (navStyles == 'icon-click') {
                html.setAttribute('data-nav-style', 'icon-click');
                localStorage.removeItem("nilovaverticalstyles");
                html.removeAttribute('data-vertical-style');
            }
            if (navStyles == 'icon-hover') {
                html.setAttribute('data-nav-style', 'icon-hover');
                localStorage.removeItem("nilovaverticalstyles");
                html.removeAttribute('data-vertical-style');
            }
        }
        if (localStorage.nilovaregular) {
            let html = document.querySelector('html');
            html.setAttribute('data-page-style', 'regular');
        }
        if (localStorage.nilovaclassic) {
            let html = document.querySelector('html');
            html.setAttribute('data-page-style', 'classic');
        }
        if (localStorage.nilovamodern) {
            let html = document.querySelector('html');
            html.setAttribute('data-page-style', 'modern');
        }
        if (localStorage.nilovaflat) {
            let html = document.querySelector('html');
            html.setAttribute('data-page-style', 'flat');
        }
        if (localStorage.nilovaboxed) {
            let html = document.querySelector('html');
            html.setAttribute('data-width', 'boxed');
        }
        if (localStorage.nilovafullwidth) {
            let html = document.querySelector('html');
            html.setAttribute('data-width', 'fullwidth');
        }
        if (localStorage.nilovaheaderfixed) {
            let html = document.querySelector('html');
            html.setAttribute('data-header-position', 'fixed');
        }
        if (localStorage.nilovaheaderscrollable) {
            let html = document.querySelector('html');
            html.setAttribute('data-header-position', 'scrollable');
        }
        if (localStorage.nilovamenufixed) {
            let html = document.querySelector('html');
            html.setAttribute('data-menu-position', 'fixed');
        }
        if (localStorage.nilovamenuscrollable) {
            let html = document.querySelector('html');
            html.setAttribute('data-menu-position', 'scrollable');
        }
        if (localStorage.nilovaMenu) {
            let html = document.querySelector('html');
            let menuValue = localStorage.getItem('nilovaMenu');
            switch (menuValue) {
                case 'light':
                    html.setAttribute('data-menu-styles', 'light');
                    break;
                case 'dark':
                    html.setAttribute('data-menu-styles', 'dark');
                    break;
                case 'color':
                    html.setAttribute('data-menu-styles', 'color');
                    break;
                case 'gradient':
                    html.setAttribute('data-menu-styles', 'gradient');
                    break;
                case 'transparent':
                    html.setAttribute('data-menu-styles', 'transparent');
                    break;
                default:
                    break;
            }
        }
        if (localStorage.nilovaHeader) {
            let html = document.querySelector('html');
            let headerValue = localStorage.getItem('nilovaHeader');
            switch (headerValue) {
                case 'light':
                    html.setAttribute('data-header-styles', 'light');
                    break;
                case 'dark':
                    html.setAttribute('data-header-styles', 'dark');
                    break;
                case 'color':
                    html.setAttribute('data-header-styles', 'color');
                    break;
                case 'gradient':
                    html.setAttribute('data-header-styles', 'gradient');
                    break;
                case 'transparent':
                    html.setAttribute('data-header-styles', 'transparent');
                    break;

                default:
                    break;
            }
        }
        if (localStorage.bgimg) {
            let html = document.querySelector('html');
            let value = localStorage.getItem('bgimg');
            html.setAttribute('bg-img', value);
        }
        if (localStorage.nilovaThemeTemplate) {
            let html = document.querySelector("html");
            let themetype = localStorage.getItem("nilovaThemeTemplate");
            switch (themetype) {
              case "default":
                  html.setAttribute("data-theme-template", "default");
                  break;
          
              case "fusion":
                  html.setAttribute("data-theme-template", "fusion");
                  break;
          
              case "modern":
                  html.setAttribute("data-theme-template", "modern");
                  break;
          
              case "saas":
                  html.setAttribute("data-theme-template", "saas");
                  break;
          
              case "neon":
                  html.setAttribute("data-theme-template", "neon");
                  break;
          
              case "galaxy":
                  html.setAttribute("data-theme-template", "galaxy");
                  break;
          
              case "elegant":
                  html.setAttribute("data-theme-template", "elegant");
                  break;
          
              case "flat":
                  html.setAttribute("data-theme-template", "flat");
                  break;
          
              case "prism":
                  html.setAttribute("data-theme-template", "prism");
                  break;
          
              case "retro":
                  html.setAttribute("data-theme-template", "retro");
                  break;
          
              case "frost":
                  html.setAttribute("data-theme-template", "frost");
                  break;
          
              case "nova":
                  html.setAttribute("data-theme-template", "nova");
                  break;
          
              default:
                  break;
          }
          }
    }
    localStorageBackup()

})();