import * as THREE from 'three'

export class ChangeTexture {
    #status = false
    #textureLoader = new THREE.TextureLoader()
    #textures = []

    #isPlaying = false

    #dummyTarget = null
    #target = null
    #options = {
        scene: null,
        paths: null,
        type: 'emissive',
    }

    constructor(target, options) {
        try {
            if (!target) {
                throw new Error('? You need to define a target mesh with material')
            }
            if (!options.paths) {
                throw new Error('? You need to define a texture paths in options')
            }
            if (!options.scene) {
                throw new Error('? You need to define a scene in options')
            }

            this.#status = true
        } catch (error) {
            console.warn(error.message)
        }

        if (this.#status) {
            this.#target = target
            this.#options.scene = options.scene
            this.#options.paths = options.paths
            this.#options.type = options.type

            this.#build()
            this.#loadTexture()
        } else {
            console.error('! One or more error is exist...')
        }
    }

    #loadTexture() {
        this.#options.paths.forEach(path => {
            this.#textures.push(this.#textureLoader.load(path, texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false;
                texture.colorSpace = THREE.SRGBColorSpace
            }))
        });
    }

    #build() {
        this.#dummyTarget = this.#target.clone()
        this.#dummyTarget.material = this.#target.material.clone()

        this.#target.material.transparent = true
        this.#dummyTarget.material.transparent = true

        this.#dummyTarget.material.opacity = 0

        this.#target.parent.add(this.#dummyTarget)
    }

    changeTexture(index) {
        if (!this.#isPlaying) {
            this.#isPlaying = true
            this.#dummyTarget.material.transparent = true
            this.#dummyTarget.material.opacity = 0
            this.#dummyTarget.material.emissiveMap = this.#textures[index];

            const timeline = gsap.timeline({
                onComplete: () => {
                    this.#target.material = this.#dummyTarget.material.clone()
                    this.#target.material.opacity = 1
                    this.#dummyTarget.material.opacity = 0

                    this.#isPlaying = false
                }
            })

            timeline
                .to(this.#target.material, {
                    duration: 1,
                    opacity: 0
                })
                .to(this.#dummyTarget.material, {
                    duration: 1,
                    opacity: 1
                }, "-=1");
        }
    }
}
