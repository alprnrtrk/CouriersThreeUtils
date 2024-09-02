import gsap from "gsap";

export default class CustomTimeline {
    // Indicates whether the class has been successfully initialized
    #isInitialized = false;

    // Holds the timeline entries, which are created based on the provided keyframes
    // Each entry will define a specific property of the target and its animation details
    #timelineEntries = [];

    // Stores the current progress value of the animation (typically between 0 and 100)
    // This value determines how far along the animation is at any given time
    #progressValue = 0;

    // Reference to the target object that will be animated
    // This is the object whose properties will be modified over time according to the keyframes
    #target = null;

    // Stores the keyframes provided to the constructor
    // Keyframes define the percentage points and corresponding property values for the animation
    #keyframes = null;

    constructor(target, keyframes) {
        try {
            // Validate that both target and keyframes are provided
            if (!target) {
                throw new Error("Target object is required.");
            }
            if (!keyframes) {
                throw new Error("Keyframes object is required.");
            }

            // Mark as initialized if no errors
            this.#isInitialized = true;
        } catch (error) {
            console.warn(error);
        }

        // Proceed with initialization if valid inputs were provided
        if (this.#isInitialized) {
            this.#target = target;
            this.#keyframes = keyframes;

            // Initialize the timeline based on provided keyframes
            this.#initializeTimeline();
        } else {
            console.error('Initialization failed due to missing target or keyframes.');
        }
    }

    /**
     * Initializes the timeline by mapping keyframes to timeline entries.
     * Each entry contains the property to animate and its corresponding value range.
     */
    #initializeTimeline() {
        const keyframeKeys = Object.keys(this.#keyframes); // Get the percentage points from keyframes
        let lastDefinedValues = {}; // Track the last defined values for each property

        // Loop through each percentage point in the keyframes
        for (let i = 0; i < keyframeKeys.length; i++) {
            const currentPercent = keyframeKeys[i]; // Current percentage point
            const nextPercent = keyframeKeys[i + 1] || '100'; // Next percentage point or default to 100%

            // Update last defined values with the current keyframe's properties
            for (const prop in this.#keyframes[currentPercent]) {
                lastDefinedValues[prop] = this.#keyframes[currentPercent][prop];
            }

            // Create a timeline entry for each property, including its value range and percentage range
            for (const prop in lastDefinedValues) {
                const timelineEntry = {
                    property: prop, // The property to animate
                    percentMin: parseInt(currentPercent), // Start percentage for this animation step
                    percentMax: parseInt(nextPercent), // End percentage for this animation step
                    valueMin: lastDefinedValues[prop], // Start value for this property
                    valueMax: this.#keyframes[nextPercent] && this.#keyframes[nextPercent][prop] !== undefined
                        ? this.#keyframes[nextPercent][prop] // End value if defined in the next keyframe
                        : lastDefinedValues[prop] // Or retain the last defined value
                };

                // Add this entry to the timeline
                this.#timelineEntries.push(timelineEntry);
            }
        }
    }

    /**
     * Updates the target object based on the current progress value.
     * Maps the current progress to the corresponding property values.
     */
    update() {
        // Iterate through each timeline entry to update the target properties
        this.#timelineEntries.forEach(entry => {
            let targetProperty = this.#target;

            const propertyKeys = entry.property.split('_'); // Split nested properties by underscore

            // Traverse the target object to find the nested property
            for (let i = 0; i < propertyKeys.length - 1; i++) {
                const key = propertyKeys[i];

                // Create nested objects if they don't exist
                if (!targetProperty[key]) {
                    targetProperty[key] = {};
                }

                targetProperty = targetProperty[key];
            }

            const lastKey = propertyKeys[propertyKeys.length - 1]; // The final key in the nested object

            // Update the property value based on the current progress
            if (this.#progressValue > entry.percentMin && this.#progressValue < entry.percentMax) {
                targetProperty[lastKey] = gsap.utils.mapRange(entry.percentMin, entry.percentMax, entry.valueMin, entry.valueMax, this.#progressValue);
            } else if (this.#progressValue >= entry.percentMax) {
                // If progress is beyond the max percent, set the property to its final value
                targetProperty[lastKey] = entry.valueMax;
            }
        });
    }

    /**
     * Sets the progress of the timeline, triggering an update of the target properties.
     * @param {number} value - The current progress value (typically between 0 and 100).
     */
    set progress(value) {
        this.#progressValue = value; // Update the internal progress value
        this.update(); // Trigger the update of target properties
    }

    /**
     * Gets the timeline entries for debugging or inspection purposes.
     * @return {Array} The timeline entries.
     */
    get timelineEntries() {
        return this.#timelineEntries; // Return the timeline entries for external use
    }
}
