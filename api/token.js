export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY not configured in Vercel env vars' });
  }

  try {
    const tokenResp = await fetch('https://streaming.assemblyai.com/v3/token?expires_in_seconds=1800', {
      method: 'GET',
      headers: { 'Authorization': apiKey },
    });

    if (!tokenResp.ok) throw new Error('Token generation failed');

    const data = await tokenResp.json();
    res.status(200).json({ token: data.token });
  } catch (error) {
    console.error('AssemblyAI token error:', error);
    res.status(500).json({ error: 'Failed to generate temporary AssemblyAI token' });
  }
}
