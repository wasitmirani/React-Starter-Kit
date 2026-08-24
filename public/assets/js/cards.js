(function () {
    "use strict";
    let DIV_BOX = ".box";
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
    
})();