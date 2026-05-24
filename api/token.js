export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  
  if (!apiKey) {
    console.error('ASSEMBLYAI_API_KEY not configured in Vercel env vars');
    return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY not configured' });
  }

  try {
    const tokenResponse = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expires_in: 1800 })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('AssemblyAI token error:', tokenResponse.status, errorText);
      return res.status(502).json({ error: `AssemblyAI error: ${errorText}` });
    }

    const data = await tokenResponse.json();
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('Token generation failed:', error.message);
    return res.status(500).json({ error: 'Failed to generate token. Please try again.' });
  }
}
