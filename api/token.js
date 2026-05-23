export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY not configured in Vercel env vars' });
  }

  try {
    // 1. MUST hit their REST API domain (api.assemblyai.com), not their streaming socket domain
    // 2. MUST use a POST request to generate a temporary token
    const tokenResp = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST', 
      headers: { 
        'Authorization': apiKey,
        'Content-Type': 'application/json' // AssemblyAI requires this header to process the body
      },
      body: JSON.stringify({ expires_in: 1800 }) // Token lasts for 30 minutes
    });

    if (!tokenResp.ok) {
      const errorText = await tokenResp.text();
      throw new Error(`AssemblyAI rejected request: ${errorText}`);
    }

    const data = await tokenResp.json();
    
    // Send the safe, temporary token back to your main app
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('AssemblyAI token error:', error);
    return res.status(500).json({ error: 'Failed to generate temporary AssemblyAI token' });
  }
}
