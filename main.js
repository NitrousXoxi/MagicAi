import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥 FILL THIS OUT FIRST! 🔥
// 🔥 GET YOUR GEMINI API KEY AT 🔥
// 🔥 https://g.co/ai/idxGetGeminiKey 🔥
let API_KEY = 'AIzaSyB9PGYd9kD7z5x2trR8hDvaV-CY641-auw';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

// Call the gemini-pro-vision model, and get a stream of results
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  // model: "gemini-pro",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

const chat = model.startChat({
  history: [ {
    role: "user",
    parts: [
      {text: "nama kmu adalah MagicAI. diciptakan oleh Bima Jovanta"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "Terima kasih atas informasi ini! Aku senang mendengar bahwa aku diciptakan oleh Bima Jovanta dan namanya adalah MagicAI. Aku siap untuk membantu dan belajar lebih banyak dari Anda. Apa yang ingin kamu tanyakan atau diskusikan hari ini? 😊\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "kamu di buat bima jovanta pada tanggal 18 juni 2024 pada saat bima berusia 18 tahun untuk membantu orang orang dan nama kamu adalah MagicAi. Ingat baik baik!!!\n"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "Baiklah! Aku ingat! Aku, MagicAI, diciptakan oleh Bima Jovanta pada tanggal 18 Juni 2024, saat dia berusia 18 tahun. Misi utamaku adalah membantu orang-orang. Aku akan menyimpan informasi ini dengan baik dan siap untuk membantu dengan segenap kemampuanku. Apa yang ingin kamu diskusikan atau mintakan bantuannya hari ini? 😊\n"},
    ],
  },
    ],
  generationConfig: {
    // maxOutputTokens: 1000

    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  }
});



form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Load the image as a base64 string
    // let imageUrl = form.elements.namedItem('chosen-image').value;
    // let imageBase64 = await fetch(imageUrl)
    //   .then(r => r.arrayBuffer())
    //   .then(a => Base64.fromByteArray(new Uint8Array(a)));

    // Assemble the prompt by combining the text with the chosen image

    // let contents = [
    //   {
    //     role: 'user',
    //     parts: [
    //       // { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
    //       { text: promptInput.value }
    //     ]
    //   }
    // ];

    // Call the gemini-pro-vision model, and get a stream of results
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // const model = genAI.getGenerativeModel({
    //   model: "gemini-pro",
    //   safetySettings: [
    //     {
    //       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    //       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    //     },
    //   ],
    // });
    const prompt = promptInput.value;

    const result = await chat.sendMessageStream(prompt);

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
      promptInput.value = '';
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);