import queue
import threading

import speech_recognition as sr
from transformers import AutoTokenizer, AutoModelForCausalLM


def transcribe_and_answer():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    print("Loading language model...")
    tokenizer = AutoTokenizer.from_pretrained("gpt2")
    model = AutoModelForCausalLM.from_pretrained("gpt2")

    prompt_prefix = (
        "You are an interview candidate. Answer the questions in a clear and professional "
        "manner so that you pass the interview."
    )

    q = queue.Queue()

    def record_audio():
        with mic as source:
            recognizer.adjust_for_ambient_noise(source)
            print("Listening...")
            while True:
                audio = recognizer.listen(source)
                q.put(audio)

    threading.Thread(target=record_audio, daemon=True).start()

    while True:
        audio = q.get()
        try:
            text = recognizer.recognize_whisper(audio)
            print(f"You said: {text}")

            input_prompt = prompt_prefix + "\nQuestion: " + text + "\nAnswer:"
            inputs = tokenizer.encode(input_prompt, return_tensors="pt")
            output = model.generate(inputs, max_length=200, do_sample=True, top_p=0.95)
            answer = tokenizer.decode(output[0], skip_special_tokens=True)
            print("AI:", answer[len(input_prompt):].strip())
        except Exception as e:
            print("Transcription error:", e)


if __name__ == "__main__":
    transcribe_and_answer()
