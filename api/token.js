export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API key from Vercel environment variables
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  
  if (!apiKey) {
    console.error('ASSEMBLYAI_API_KEY not configured in Vercel env vars');
    return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY not configured' });
  }

  try {
    // Call AssemblyAI's REST API to generate a temporary token
    // IMPORTANT: Must use api.assemblyai.com (REST API), not streaming.assemblyai.com (WebSocket)
    const tokenResponse = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expires_in: 1800 }) // Token valid for 30 minutes
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('AssemblyAI token error:', tokenResponse.status, errorText);
      return res.status(502).json({ error: `AssemblyAI error: ${errorText}` });
    }

    const data = await tokenResponse.json();
    
    // Return only the temporary token to the client
    // The actual API key never leaves the server
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('Token generation failed:', error.message);
    return res.status(500).json({ error: 'Failed to generate token. Please try again.' });
  }
}
