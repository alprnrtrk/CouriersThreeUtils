class webGlDistortion extends HTMLElement {
    #root = this.attachShadow({ mode: 'closed' })
    #style = document.createElement('style')

    constructor() {
        super()
    }

    connectedCallback() {
        this.#load()
    }

    #load() {
        this.#setupHTML()
        this.#playGroud()
        this.#listen()
    }

    #setupHTML() {
        this.#style.innerHTML = `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
        `
        this.#root.appendChild(this.#style)
    }

    #playGroud() {

    }

    #listen() {

    }
}

customElements.define('webgl-distortion', webGlDistortion)
