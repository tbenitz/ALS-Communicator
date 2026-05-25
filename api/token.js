export default async function handler(req, res) {
  // CORS
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
      console.error('MISSING: ASSEMBLYAI_API_KEY environment variable');
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    console.log('API Key exists, length:', apiKey.length);
    
    // Call AssemblyAI REST API for token
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expires_in: 1800 })
    });

    const responseText = await response.text();
    console.log('AssemblyAI response status:', response.status);
    
    if (!response.ok) {
      console.error('AssemblyAI error response:', responseText);
      return res.status(502).json({ 
        error: 'AssemblyAI token generation failed',
        status: response.status,
        detail: responseText.substring(0, 200)
      });
    }

    const data = JSON.parse(responseText);
    console.log('Token generated, length:', data.token?.length);
    
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('Function error:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Server function error', 
      message: error.message 
    });
  }
}
