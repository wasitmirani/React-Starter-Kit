// for nummber of products selected 

var value = 1,
minValue = 0,
maxValue = 30;

let productMinusBtn1 = document.querySelectorAll(".product-quantity-minus")
let productPlusBtn1 = document.querySelectorAll(".product-quantity-plus")
productMinusBtn1.forEach((element) => {
   element.onclick = () => {
       value = Number(element.parentElement.childNodes[3].value)
       if (value > minValue) {
           value = Number(element.parentElement.childNodes[3].value) - 1;
           element.parentElement.childNodes[3].value = value;
       }
   }
})
productPlusBtn1.forEach((element) => {
   element.onclick = () => {
       if (value < maxValue) {
           value = Number(element.parentElement.childNodes[3].value) + 1;
           element.parentElement.childNodes[3].value = value;
       }
   }
})

var swiper = new Swiper(".pos-orders-swiper", {
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    loop: true,
    slidesPerView: 1,
    spaceBetween: 20,
    autoplay: {
        delay: 1000,
        disableOnInteraction: false,
    },
    breakpoints: {
        500: {
            slidesPerView: 1,
            spaceBetween: 20,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 20,
        },
        1024: {
            slidesPerView: 2,
            spaceBetween: 20,
        },
        1200: {
            slidesPerView: 2,
            spaceBetween: 20,
        },
        1400: {
            slidesPerView: 3,
            spaceBetween: 20,
        },
        1600: {
            slidesPerView: 3,
            spaceBetween: 20,
        },
        1800: {
            slidesPerView: 3,
            spaceBetween: 20,
        },
    },
});

/* For Card Active */
document.addEventListener('DOMContentLoaded', function() {
    var cards = document.querySelectorAll('.nft-tag');
    cards.forEach(function(card) {
        card.addEventListener('click', function() {
            cards.forEach(function(c) {
                c.classList.remove('active');
            });
            card.classList.add('active');
        });
    });
});
/* For Card Active */

/* Isotope Layout Js */
// document.addEventListener("DOMContentLoaded", function (e) { 
    var listWrapper = document.querySelector(".list-wrapper");
    var isotope;
    if (listWrapper) {
        setTimeout(() => {
            isotope = new Isotope(listWrapper, {
                itemSelector: ".box-item",
                // layoutMode: 'fitRows',
            });
        }, 100);
    }
    var categoriesFilter = document.querySelectorAll(".pos-category");
    if (categoriesFilter.length > 0) {
        categoriesFilter.forEach(function (filter) {
            filter.addEventListener("click", function (event) {
                if (event.target.matches(".categories")) {
                    var filterValue = event.target.getAttribute("data-filter");
                    if (filterValue) {
                        isotope.arrange({ filter: filterValue });
                    }
                }
            });
        });
    }
// });
/* Isotope layout Js */


document.querySelectorAll("#switcher-boxed , #switcher-full-width ,#switcher-default-width, #reset-all").forEach((element)=>{
    element.addEventListener("click",()=>{
        setTimeout(() => {
            console.log("working");
            new Isotope(document.querySelector(".list-wrapper"), {
                itemSelector: ".box-item",
            });
        }, 100);
    })
})
