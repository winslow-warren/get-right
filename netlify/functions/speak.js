exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ELEVENLABS_API_KEY not set in Netlify environment variables' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { text, voiceId } = body;

  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: 'text is required' }) };
  }

  const voice = voiceId || 'qkmInDL6rZEVxAN2Tmwh';
  const cleanText = text.replace(/[*_~`#]/g, '').trim().slice(0, 500);

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('ElevenLabs error:', res.status, errText);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `ElevenLabs error ${res.status}`, details: errText })
      };
    }

    const audioBuffer = await res.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'audio/mpeg';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: base64Audio, contentType })
    };

  } catch (err) {
    console.error('speak error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
