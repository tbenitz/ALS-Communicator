export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY not configured in Vercel env vars' });
  }

  try {
    const tokenResp = await fetch('https://api.assemblyai.com/v2/realtime/token', {
        method: 'POST', 
        headers: { 
          'Authorization': apiKey,
          'Content-Type': 'application/json' // Crucial header for payload validation
        },
        body: JSON.stringify({ expires_in: 1800 })
    });

    if (!tokenResp.ok) {
      const errorText = await tokenResp.text();
      throw new Error(`Token generation failed: ${errorText}`);
    }

    const data = await tokenResp.json();
    res.status(200).json({ token: data.token });
  } catch (error) {
    console.error('AssemblyAI token error:', error);
    res.status(500).json({ error: 'Failed to generate temporary AssemblyAI token' });
  }
}
