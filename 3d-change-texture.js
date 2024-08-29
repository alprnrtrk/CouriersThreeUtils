import * as THREE from 'three';
import gsap from 'gsap';

export class ChangeTexture {
    #isInitialized = false; // Indicates if the class has been successfully initialized
    #textureLoader = new THREE.TextureLoader(); // Loader for textures
    #textures = []; // Array to hold loaded textures

    #isPlaying = false; // Indicates if a texture change animation is in progress

    #dummyMesh = null; // Temporary mesh used for smooth texture transition
    #targetMesh = null; // The main mesh that will have its texture changed
    #options = {
        scene: null, // The scene where the mesh is located
        paths: null, // Array of texture paths to be used for the transition
        type: 'emissive', // Type of texture to apply (e.g., emissive)
    };

    /**
     * Constructor for the ChangeTexture class.
     * @param {THREE.Mesh} targetMesh - The target mesh to apply textures to.
     * @param {Object} options - Configuration options for texture changes.
     */
    constructor(targetMesh, options) {
        try {
            if (!targetMesh) {
                throw new Error('Target mesh with material is required.');
            }
            if (!options.paths) {
                throw new Error('Texture paths are required in options.');
            }
            if (!options.scene) {
                throw new Error('Scene is required in options.');
            }

            this.#isInitialized = true; // Mark as initialized if no errors
        } catch (error) {
            console.warn(error.message);
        }

        if (this.#isInitialized) {
            this.#targetMesh = targetMesh;
            this.#options.scene = options.scene;
            this.#options.paths = options.paths;
            this.#options.type = options.type;

            this.#build();
            this.#loadTextures();
        } else {
            console.error('Initialization failed due to errors.');
        }
    }

    /**
     * Loads textures from the specified paths.
     */
    #loadTextures() {
        this.#options.paths.forEach(path => {
            this.#textures.push(this.#textureLoader.load(path, texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false;
                texture.colorSpace = THREE.SRGBColorSpace;
            }));
        });
    }

    /**
     * Sets up the dummy mesh for texture transitions.
     */
    #build() {
        this.#dummyMesh = this.#targetMesh.clone();
        this.#dummyMesh.material = this.#targetMesh.material.clone();

        this.#targetMesh.material.transparent = true;
        this.#dummyMesh.material.transparent = true;

        this.#dummyMesh.material.opacity = 0;

        this.#targetMesh.parent.add(this.#dummyMesh);
    }

    /**
     * Changes the texture on the target mesh.
     * @param {number} index - Index of the texture to apply from the textures array.
     */
    changeTexture(index) {
        if (!this.#isPlaying) {
            this.#isPlaying = true;

            this.#dummyMesh.material.transparent = true;
            this.#dummyMesh.material.opacity = 0;
            this.#dummyMesh.material.emissiveMap = this.#textures[index];

            const timeline = gsap.timeline({
                onComplete: () => {
                    // Restore target mesh material and finalize the transition
                    this.#targetMesh.material = this.#dummyMesh.material.clone();
                    this.#targetMesh.material.opacity = 1;
                    this.#dummyMesh.material.opacity = 0;

                    this.#isPlaying = false;
                }
            });

            timeline
                .to(this.#targetMesh.material, {
                    duration: 1,
                    opacity: 0
                })
                .to(this.#dummyMesh.material, {
                    duration: 1,
                    opacity: 1
                }, "-=1"); // Overlap the end of the first animation
        }
    }
}
