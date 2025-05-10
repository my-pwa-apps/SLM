# Simple Language Model (SLM)

A minimal in-browser language model application that runs entirely client-side using Transformers.js. This application loads and runs a small transformer-based language model in your browser with no backend requirements.

## Features

- Runs completely in the browser using WebAssembly
- Uses Hugging Face's Transformers.js library
- Loads a lightweight transformer model (Xenova/distilgpt2)
- Works offline after initial load (Progressive Web App)
- Simple, responsive UI that works on both desktop and mobile
- Real-time text generation based on user prompts

## Getting Started

### Running Locally

1. Clone this repository
2. Open the project folder
3. Serve the files using any static file server:

Using Python:
```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Using Node.js (with http-server):
```bash
# Install http-server globally if you don't have it
npm install -g http-server

# Run the server
http-server
```

4. Open your browser and navigate to `http://localhost:8000` (or the port shown in your terminal)

### Using the Application

1. Wait for the model to load (the status indicator will change to "Model ready!")
2. Enter a prompt in the text area (e.g., "Once upon a time")
3. Click the "Generate" button or press Ctrl+Enter
4. View the generated text in the output area

## Technical Details

- **Model**: Xenova/distilgpt2 (a lightweight version of GPT-2)
- **Library**: Transformers.js (WebAssembly-compatible version of Hugging Face Transformers)
- **Frontend**: Vanilla JavaScript, HTML, and CSS
- **Offline Capability**: Service Worker for caching and Progressive Web App functionality

## Performance Considerations

- The model is approximately 300MB in size and will be downloaded on first use
- Text generation performance varies by device; modern desktops and high-end mobile devices will have the best experience
- Initial load may take several seconds to minutes depending on your device and connection speed

## License

MIT
