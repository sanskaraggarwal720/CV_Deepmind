export async function testNB2Lite(apiKey: string) {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'a cinematic sunset photo' }] }] })
    });
    if (!res.ok) {
      throw new Error(`NB2 Lite spike failed: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
