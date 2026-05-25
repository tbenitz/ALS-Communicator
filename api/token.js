export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Try the standard token endpoint first
    let response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expires_in: 1800 })
    });

    // If token endpoint fails, return the API key directly as token
    // (Some newer AssemblyAI accounts support this)
    if (!response.ok) {
      console.log('Token endpoint failed, using API key directly');
      // Return the API key - it works directly in WebSocket URL for newer accounts
      return res.status(200).json({ token: apiKey });
    }

    const data = await response.json();
    return res.status(200).json({ token: data.token });

  } catch (error) {
    // Fallback: return API key directly
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (apiKey) {
      console.log('Error, falling back to direct API key');
      return res.status(200).json({ token: apiKey });
    }
    return res.status(500).json({ error: error.message });
  }
}
