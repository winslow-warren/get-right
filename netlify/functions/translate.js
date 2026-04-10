exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Netlify environment variables' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { mode, symptoms, systemPrompt, messages } = body;

  // ── MODE: guide_conversation (used by both AI Guide and The Nook) ──
  if (mode === 'guide_conversation') {
    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'messages array required' }) };
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 400,
          system: systemPrompt || 'You are a warm, knowledgeable health advocate for Black women.',
          messages: messages
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Anthropic API error:', data);
        return {
          statusCode: res.status,
          body: JSON.stringify({ error: data.error?.message || 'API error', details: JSON.stringify(data) })
        };
      }

      const reply = data.content?.[0]?.text || '';
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      };

    } catch (err) {
      console.error('guide_conversation error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── MODE: translate (Bias Translator) ──
  if (!symptoms) {
    return { statusCode: 400, body: JSON.stringify({ error: 'symptoms required' }) };
  }

  const isDismissed = mode === 'dismissed';

  const systemMsg = isDismissed
    ? `You are a health advocate for Black women. A provider dismissed or disbelieved this woman. Respond with:
1. Validation of her experience (2-3 sentences, warm and affirming)
2. Exact word-for-word scripts she can say to this provider or the next one (3 numbered scripts)
3. Her patient rights in this situation (1 paragraph)
4. When to escalate or seek emergency care (1 paragraph)

Respond ONLY as JSON (no markdown, no preamble):
{"feeling":"...","advocacy":"script1\\nscript2\\nscript3","tests":"...","escalate":"..."}`
    : `You are a medical translator and health advocate for Black women. Given a symptom description, provide:
1. Validation that acknowledges her experience without minimizing it (2 sentences)
2. Clinical medical language her provider must take seriously (2-3 sentences with medical terminology)
3. Specific tests or referrals she should request by name
4. Exact language for advocating for herself if dismissed
5. Red flag symptoms that warrant urgent/emergency care

Respond ONLY as JSON (no markdown, no preamble):
{"feeling":"...","clinical":"...","tests":"...","advocacy":"...","escalate":"..."}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 800,
        system: systemMsg,
        messages: [{ role: 'user', content: symptoms }]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Translate API error:', data);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data.error?.message || 'API error' })
      };
    }

    const text = data.content?.[0]?.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
      parsed = { feeling: text, clinical: '', tests: '', advocacy: '', escalate: '' };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    console.error('translate error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
