const transcriptEl = document.getElementById("transcript");
const answerEl = document.getElementById("answer");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const answerBtn = document.getElementById("answerBtn");
const clearBtn = document.getElementById("clearBtn");
const autoAnswer = document.getElementById("autoAnswer");
const manualQuestion = document.getElementById("manualQuestion");

const endpointInput = document.getElementById("endpoint");
const modelInput = document.getElementById("model");
const apiKeyInput = document.getElementById("apiKey");
const silenceInput = document.getElementById("silence");

const roleInput = document.getElementById("role");
const toneInput = document.getElementById("tone");
const formatInput = document.getElementById("format");

let recognition;
let finalTranscript = "";
let silenceTimer;

const supportsSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

const setStatus = (text, isListening = false) => {
  statusEl.textContent = text;
  statusEl.style.background = isListening ? "#0f766e" : "#1c2a49";
};

const hasCredentials = () => {
  return Boolean(endpointInput.value.trim() && apiKeyInput.value.trim());
};

const updateButtons = (listening) => {
  startBtn.disabled = listening || !supportsSpeech;
  stopBtn.disabled = !listening;
  answerBtn.disabled =
    (!finalTranscript && !manualQuestion.value.trim()) || !hasCredentials();
};

const scheduleAutoAnswer = () => {
  clearTimeout(silenceTimer);
  if (!autoAnswer.checked) return;
  const seconds = Number.parseInt(silenceInput.value, 10) || 2;
  silenceTimer = setTimeout(() => {
    if (finalTranscript.trim()) {
      generateAnswer(finalTranscript.trim());
    }
  }, seconds * 1000);
};

const startListening = () => {
  if (!supportsSpeech) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    setStatus("Listening...", true);
    updateButtons(true);
  };

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += `${transcript.trim()} `;
        scheduleAutoAnswer();
      } else {
        interim += transcript;
      }
    }
    transcriptEl.textContent = `${finalTranscript}${interim}`.trim() || "Listening...";
    updateButtons(true);
  };

  recognition.onerror = () => {
    setStatus("Microphone error");
  };

  recognition.onend = () => {
    setStatus("Stopped");
    updateButtons(false);
  };

  recognition.start();
};

const stopListening = () => {
  if (recognition) {
    recognition.stop();
  }
};

const buildPrompt = (question) => {
  return `You are acting as an interview copilot for a candidate.\n\n` +
    `Role: ${roleInput.value}\n` +
    `Tone: ${toneInput.value}\n` +
    `Answer format: ${formatInput.value}\n\n` +
    `Provide a concise answer to the interview question below.\n` +
    `Question: ${question}`;
};

const generateAnswer = async (question) => {
  if (!question) return;
  if (!hasCredentials()) {
    answerEl.textContent = "Add an API key and endpoint to generate answers.";
    return;
  }
  answerEl.textContent = "Thinking...";
  const payload = {
    model: modelInput.value,
    messages: [
      { role: "system", content: "You are a helpful interview coach." },
      { role: "user", content: buildPrompt(question) }
    ],
    temperature: 0.4,
  };

  try {
    const response = await fetch(endpointInput.value, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKeyInput.value}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      answerEl.textContent = `Request failed (${response.status}). ${errorText}`;
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    answerEl.textContent = content || "No answer returned.";
  } catch (error) {
    answerEl.textContent = `Network error: ${error.message}`;
  }
};

startBtn.addEventListener("click", startListening);
stopBtn.addEventListener("click", stopListening);
clearBtn.addEventListener("click", () => {
  finalTranscript = "";
  manualQuestion.value = "";
  transcriptEl.textContent = "Waiting for audio...";
  answerEl.textContent = "No response yet.";
  updateButtons(false);
});
answerBtn.addEventListener("click", () => {
  const manual = manualQuestion.value.trim();
  const question = manual || finalTranscript.trim();
  generateAnswer(question);
});
manualQuestion.addEventListener("input", () => {
  updateButtons(false);
});
apiKeyInput.addEventListener("input", () => updateButtons(false));
endpointInput.addEventListener("input", () => updateButtons(false));

if (!supportsSpeech) {
  transcriptEl.textContent = "Speech recognition is not supported in this browser.";
  setStatus("Unavailable");
} else {
  setStatus("Idle");
}

updateButtons(false);
