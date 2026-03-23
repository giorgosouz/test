# Interview Copilot

A lightweight web app that listens to interview questions, transcribes them in real-time, and generates suggested answers using a free LLM (via OpenAI-compatible endpoints).

## Features
- Real-time speech-to-text using the Web Speech API.
- Auto-answer mode after a brief silence.
- Works with free LLM tiers on OpenRouter (or any OpenAI-compatible endpoint).
- Adjustable role, tone, and response format presets.

## Quick start
1. Open `index.html` in a modern Chromium-based browser.
2. Add your OpenRouter API key (or another OpenAI-compatible key).
3. Click **Start listening** and speak a question, or paste one in the text box.

## Notes
- The Web Speech API requires HTTPS or `localhost` to access the microphone. Use a local server if needed:
  ```bash
  python3 -m http.server 8000
  ```
  Then open `http://localhost:8000`.
- For the free model list on OpenRouter, see https://openrouter.ai/models?tier=free.

## Testing
- Verify the JavaScript file parses cleanly:
  ```bash
  node --check app.js
  ```
