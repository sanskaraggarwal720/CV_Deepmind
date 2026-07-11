async function runSpikes() {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in env");
    return;
  }

  console.log("Running NB2 Lite spike...");
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'a cinematic sunset photo' }] }] })
    });
    console.log("NB2 Lite Status:", res.status);
    const json = await res.json();
    if (res.status === 200) {
      console.log("NB2 Lite Output (truncated):", JSON.stringify(json).substring(0, 50));
    } else {
      console.log("Error:", json);
    }
  } catch (e) {
    console.error("NB2 Lite Error:", e);
  }

  console.log("Running Omni Flash spike...");
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-omni-flash-preview:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'generate a test video' }] }] })
    });
    console.log("Omni Flash Status:", res.status);
    const json = await res.json();
    if (res.status === 200) {
      console.log("Omni Flash Output (truncated):", JSON.stringify(json).substring(0, 50));
    } else {
      console.log("Error:", json);
    }
  } catch (e) {
    console.error("Omni Flash Error:", e);
  }
}

runSpikes();
