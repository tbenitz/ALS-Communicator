export default async function handler(req, res) {
  // 1. Set up CORS so your GitHub Pages frontend can talk to this Vercel backend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can lock this down to your GitHub Pages URL later
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Answer the browser's preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure it's a POST request
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST requests allowed' });
    return;
  }

  try {
    // 2. Grab the payload (model, prompt, tokens) sent by your ALS frontend
    const payload = req.body;

    // 3. Forward it to xAI, pulling your secret key from Vercel's environment variables
    const xaiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_API_KEY}` // Vercel uses process.env to grab the key!
      },
      body: JSON.stringify(payload)
    });

    const data = await xaiResponse.json();

    // 4. Send the xAI response directly back to your frontend
    res.status(200).json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
