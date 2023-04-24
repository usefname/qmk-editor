let htmlTemplate = `<h3>Hi</h3>`;

class QMKApp extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // init the component
        // let shadowDom = this.attachShadow({ mode: "open" });
        let template = document.getElementById("my-drop-down");
        let templateHtml = template.content.cloneNode(true);
        shadowDom.appendChild(templateHtml);

        // define the menu, menu body and hide it
        let menu = shadowDom.getElementById("my-menu");
        let menuHead = menu.children[1];
        let menuBody = menu.children[2];
        menuBody.style.display = "none";

        // toggle the menu body
        function toggleMenu() {
            menuHead.addEventListener("click", function() {
                if (menuBody.style.display === "none") {
                    menuBody.style.display = "block";
                } else {
                    menuBody.style.display = "none";
                }
            });

            menuBody.addEventListener("click", function(ev) {
                if (ev.target !== ev.currentTarget) {
                    menuHead.children[0].textContent = ev.target.textContent;
                }

                menuBody.style.display = "none";
            });
        }
        // init toggle listeners
        toggleMenu();
    }
}

// init the element
customElements.define("drop-down", DropDown);
