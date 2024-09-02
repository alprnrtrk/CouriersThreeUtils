import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import './style.css'

class ThreeCanvas extends HTMLElement {
    #root = this.attachShadow({ mode: 'closed' })
    #style = document.createElement('style')

    #scene = new T.Scene()
    #camera = new T.PerspectiveCamera()
    #renderer = new T.WebGLRenderer()

    #controller = null

    constructor() {
        super()
    }

    connectedCallback() {
        this.#load()
    }

    #load() {
        this.#setupHTML()
        this.#setupScene()
        this.#setupCamera()
        this.#setupLights()
        this.#setupHelpers()
        this.#playGroud()
        this.#animationLoop()
        this.#listen()
    }

    #setupHTML() {
        this.#style.innerHTML = `
            :host {
                display: block;
                width: 100%;
                height: 100%;
                background-color: red;
            }
        `
        this.#root.appendChild(this.#style)
    }

    #setupScene() {
        this.#renderer.setSize(this.#root.host.clientWidth, this.#root.host.clientHeight)
        this.#root.appendChild(this.#renderer.domElement)
    }

    #setupCamera() {
        this.#camera.aspect = this.#root.host.clientWidth / this.#root.host.clientHeight
        this.#camera.fov = 75
        this.#camera.near = .1
        this.#camera.far = 1000
        this.#camera.position.set(3, 3, 3)
        this.#camera.updateProjectionMatrix()
    }

    #setupLights() {
        const environment = new RoomEnvironment()
        const pmremGenerator = new T.PMREMGenerator(this.#renderer)
        const envMap = pmremGenerator.fromScene(environment).texture

        this.#scene.background = envMap
        this.#scene.backgroundIntensity = .25
        this.#scene.backgroundBlurriness = .25
        this.#scene.environment = envMap
        this.#scene.environmentIntensity = .25
    }

    #setupHelpers() {
        this.#controller = new OrbitControls(this.#camera, this.#renderer.domElement)
        this.#controller.enableDamping = true
        this.#controller.autoRotate = true
        this.#controller.update()

        const gridHelper = new T.GridHelper(50, 50)
        this.#scene.add(gridHelper)
    }

    #playGroud() {
        const geometry = new T.SphereGeometry(1, 32, 32)
        const material = new T.MeshStandardMaterial({ color: 0x00ff00 })
        const sphere = new T.Mesh(geometry, material)
        sphere.position.set(0, 0, 0)

        this.#scene.add(sphere)
    }

    #updateSize() {
        this.#renderer.setSize(this.#root.host.clientWidth, this.#root.host.clientHeight)
        this.#camera.aspect = this.#root.host.clientWidth / this.#root.host.clientHeight
        this.#camera.updateProjectionMatrix()
    }

    #listen() {
        window.addEventListener('resize', this.#updateSize.bind(this))
    }

    #animationLoop() {
        requestAnimationFrame(() => { this.#animationLoop() })
        this.#controller.update()
        this.#renderer.render(this.#scene, this.#camera)
    }
}

customElements.define('three-canvas', ThreeCanvas)
