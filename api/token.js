export default async function handler(req, res) {
  // Enforce explicit GET requests from the frontend client
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull your secret key from your saved Vercel dashboard environment configurations
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY not configured in Vercel env vars' });
  }

  try {
    // Correct token API destination path as defined by AssemblyAI documentation
    const tokenResp = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST', 
      headers: { 
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      // Configures an automatic connection lifetime window (1800 seconds = 30 minutes)
      body: JSON.stringify({ expires_in: 1800 }) 
    });

    if (!tokenResp.ok) {
      const errorText = await tokenResp.text();
      throw new Error(`AssemblyAI response breakdown: ${errorText}`);
    }

    const data = await tokenResp.json();
    
    // Explicitly return the single temporal active token string value back to the browser app
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('AssemblyAI backend token resolution error:', error);
    return res.status(500).json({ error: 'Failed to generate temporary AssemblyAI token' });
  }
}
