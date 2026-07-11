const fs = require('fs');

async function run() {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
  const model = 'gemini-omni-flash-preview';
  
  // Send a tiny base64 image (1x1 pixel)
  const tinyImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/png', data: tinyImage } },
            { text: "Animate this" },
          ],
        },
      ],
    }),
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}

run();
