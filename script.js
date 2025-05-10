// Wait until the Transformers object is available
// Model configuration
const MODEL_ID = 'Xenova/distilgpt2';
const MAX_NEW_TOKENS = 100;
const MAX_LENGTH = 200;

// We'll access pipeline and env after the library is loaded
let pipeline;
let env;

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
        // Wait until the library is fully loaded
        if (typeof window.Transformers === 'undefined' || 
            typeof window.Transformers.pipeline === 'undefined') {
            loadingStatus.textContent = "Waiting for library to load...";
            setTimeout(initializeModel, 500);
            return;
        }

        // Access pipeline and env from the Transformers global object
        pipeline = window.Transformers.pipeline;
        env = window.Transformers.env;
        
        // Configure WASM backend if env is available
        if (env && env.backends && env.backends.onnx) {
            env.backends.onnx.wasm.numThreads = 1;
        }
        
        // Initialize the pipeline
        generator = await pipeline(
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

// Initialize the model when the page loads
document.addEventListener('DOMContentLoaded', initializeModel);
