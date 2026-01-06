
export default async function handler(request, response) {
    // Only allow GET requests (or POST if you prefer)
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const clientId = process.env.VITE_TDX_CLIENT_ID || process.env.TDX_CLIENT_ID;
    const clientSecret = process.env.VITE_TDX_CLIENT_SECRET || process.env.TDX_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return response.status(500).json({ error: 'Server misconfiguration: Missing TDX credentials' });
    }

    const AUTH_URL = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const tdxResponse = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!tdxResponse.ok) {
            const errText = await tdxResponse.text();
            return response.status(tdxResponse.status).json({ error: `TDX Error: ${errText}` });
        }

        const data = await tdxResponse.json();

        // Return the token to the frontend
        // Cache-Control: Cache for 60 seconds less than the token expiry if possible, 
        // but simplified: cache for a short period or rely on frontend caching.
        // TDX tokens are usually valid for 24 hours (86400 seconds).
        // We can tell Vercel to cache this response.
        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        return response.status(200).json(data);
    } catch (error) {
        console.error('Token Exchange Error:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
