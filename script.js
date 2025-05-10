// Model configuration
const MODEL_ID = 'Xenova/distilgpt2';
const MAX_NEW_TOKENS = 100;
const MAX_LENGTH = 200;

// DOM Elements
const modelStatus = document.getElementById('model-status');
const promptInput = document.getElementById('prompt-input');
const generateBtn = document.getElementById('generate-btn');
const outputText = document.getElementById('output-text');
const loadingProgress = document.getElementById('loading-progress');
const loadingStatus = document.getElementById('loading-status');

// Class to handle loading status updates
class MyProgressCallback {
    constructor() {
        this.currentTask = null;
    }
    
    onDownloadProgress(progress) {
        if (progress.total) {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            loadingProgress.style.width = `${percentage}%`;
            loadingStatus.textContent = `Downloading model: ${percentage}%`;
        }
    }
    
    onTaskStart(taskName) {
        this.currentTask = taskName;
        loadingStatus.textContent = `Starting task: ${taskName}`;
    }
    
    onTaskProgress(taskName, progress) {
        if (this.currentTask === taskName && progress.total) {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            loadingProgress.style.width = `${percentage}%`;
            loadingStatus.textContent = `${taskName}: ${percentage}%`;
        }
    }
    
    onTaskComplete(taskName) {
        if (this.currentTask === taskName) {
            loadingProgress.style.width = '100%';
            loadingStatus.textContent = `Completed task: ${taskName}`;
        }
    }
}

// Initialize the text generation pipeline
let generator;
async function initializeModel() {
    try {
        console.log("Starting model initialization");
        
        // Access the pipeline from window object (previously set in the HTML)
        // Changed window.pipeline to window.Xenova.pipeline
        const pipelineFunc = window.Xenova.pipeline; 
        
        if (!pipelineFunc) {
            // Updated error message to reflect the change
            throw new Error("Pipeline function (window.Xenova.pipeline) is not available. Make sure the transformers library is loaded properly.");
        }
        
        // Initialize the pipeline
        generator = await pipelineFunc(
            'text-generation',
            MODEL_ID,
            {
                progress_callback: new MyProgressCallback(),
            }
        );
          // Update UI when model is ready
        modelStatus.textContent = 'Model ready!';
        modelStatus.classList.add('ready');
        generateBtn.disabled = false;
        loadingStatus.textContent = 'Model loaded successfully!';
        console.log("Model initialization complete");
    } catch (error) {
        console.error('Error initializing the model:', error);
        modelStatus.textContent = 'Error loading model. See console for details.';
        modelStatus.classList.add('error');
        loadingStatus.textContent = 'Failed to load model.';
    }
}

// Generate text based on prompt
async function generateText() {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        alert('Please enter a prompt first.');
        return;
    }
    
    try {
        // Disable UI during generation
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        outputText.textContent = 'Generating...';
        
        // Generate the text
        const result = await generator(prompt, {
            max_new_tokens: MAX_NEW_TOKENS,
            max_length: MAX_LENGTH,
            temperature: 0.7,
            do_sample: true,
            no_repeat_ngram_size: 2
        });
        
        // Display the generated text
        outputText.textContent = result[0].generated_text;
    } catch (error) {
        console.error('Error during generation:', error);
        outputText.textContent = 'Error generating text. See console for details.';
    } finally {
        // Re-enable UI
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate';
    }
}

// Add event listeners
generateBtn.addEventListener('click', generateText);
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        generateText();
    }
});

// Start initialization when document is fully loaded to ensure pipeline is available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModel);
} else {
    // If DOMContentLoaded already fired, call directly but with a short delay
    setTimeout(initializeModel, 100);
}
