export async function testOmniFlash(apiKey: string) {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-omni-flash-preview:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'generate a test video' }] }] })
    });
    if (!res.ok) {
      throw new Error(`Omni Flash spike failed: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
