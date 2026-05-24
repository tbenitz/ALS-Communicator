export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  
  if (!apiKey) {
    console.error('ASSEMBLYAI_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    console.log('Requesting AssemblyAI token...');
    
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
      console.error('AssemblyAI error:', tokenResponse.status, errorText);
      return res.status(502).json({ error: `AssemblyAI: ${errorText}` });
    }

    const data = await tokenResponse.json();
    console.log('Token generated successfully');
    
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('Token generation failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
