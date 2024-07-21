import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥 FILL THIS OUT FIRST! 🔥
// 🔥 GET YOUR GEMINI API KEY AT 🔥
// 🔥 https://g.co/ai/idxGetGeminiKey 🔥
let API_KEY = 'AIzaSyDn2Ms5JdVe0-ohNRgHO9eJ4fLWH5LwLpY'; // Ubah ini dengan cara yang aman

let form = document.querySelector('.prompt-form');
let promptInput = document.querySelector('input[name="prompt"]');
const imageInput = document.querySelector('#image-upload');
let output = document.querySelector('.output');
const filenameDisplay = document.querySelector('#file-upload-filename');

// Initialize GoogleGenerativeAI with the provided API key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Pastikan menggunakan model yang mendukung fitur yang diperlukan
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [
        { text: "nama kmu adalah MagicAI. diciptakan oleh Bima Jovanta" },
      ],
    },
    {
      role: "model",
      parts: [
        { text: "Terima kasih atas informasi ini! Aku senang mendengar bahwa aku diciptakan oleh Bima Jovanta dan namanya adalah MagicAI. Aku siap untuk membantu dan belajar lebih banyak dari Anda. Apa yang ingin kamu tanyakan atau diskusikan hari ini? 😊\n" },
      ],
    },
    {
      role: "user",
      parts: [
        { text: "kamu di buat bima jovanta pada tanggal 18 juni 2024 pada saat bima berusia 18 tahun untuk membantu orang orang dan nama kamu adalah MagicAi. Ingat baik baik!!!\n" },
      ],
    },
    {
      role: "model",
      parts: [
        { text: "Baiklah! Aku ingat! Aku, MagicAI, diciptakan oleh Bima Jovanta pada tanggal 18 Juni 2024, saat dia berusia 18 tahun. Misi utamaku adalah membantu orang-orang. Aku akan menyimpan informasi ini dengan baik dan siap untuk membantu dengan segenap kemampuanku. Apa yang ingin kamu diskusikan atau mintakan bantuannya hari ini? 😊\n" },
      ],
    },
  ],
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  }
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file) {
    filenameDisplay.textContent = file.name;
  } else {
    filenameDisplay.textContent = 'Tidak ada file yang dipilih';
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    const prompt = promptInput.value;
    let imageBase64 = null;
    const messageParts = [{ text: prompt }];

    if (imageInput.files.length > 0) {
      const file = imageInput.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      imageBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(Base64.fromByteArray(new Uint8Array(reader.result)));
        reader.onerror = reject;
      });

      if (imageBase64) {
        messageParts.push({ inline_data: { mime_type: file.type, data: imageBase64 } });
      }
    }

    const result = await chat.sendMessageStream(messageParts);

    // Initialize MarkdownIt for markdown parsing
    let buffer = [];
    const md = new MarkdownIt();

    // Read from the stream and interpret the output as markdown
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
    promptInput.value = '';
    imageInput.value = ''; // Reset input file
    filenameDisplay.textContent = 'Tidak ada file yang dipilih'; // Reset filename display

  } catch (e) {
    output.innerHTML = '<hr>' + e.message;
  }
};

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);
