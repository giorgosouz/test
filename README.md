# Interview Helper Demo

This project is a simple proof-of-concept app that listens to your microphone,
transcribes the speech, and feeds the text into a local language model to
suggest interview answers in real time.

## Setup

Install dependencies (Python 3.8+ recommended):

```bash
pip install -r requirements.txt
```

The script uses the open-source `gpt2` model from Hugging Face and the
`whisper` speech recognition method from the `speech_recognition` library. The
first run will download the model weights.

## Usage

Run the helper from your terminal:

```bash
python interview_helper.py
```

Speak into your microphone. The program will transcribe your question and
respond with a suggested answer.

This is only a small demo meant to show how you can integrate free speech
recognition and open-source language models.
