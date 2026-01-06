
/**
 * TDX API Authentication Utility
 * Handles obtaining and refreshing access tokens.
 */

const AUTH_URL = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";

let accessToken = "";
let tokenExpiration = 0;

export const getAuthToken = async () => {
    // Check if current token is still valid (with 60s buffer)
    if (accessToken && Date.now() < tokenExpiration - 60000) {
        return accessToken;
    }

    // STRATEGY: Hybrid Approach
    // 1. Try Local Environment variables (Dev mode)
    // 2. Fallback to Serverless Function (Production/Vercel)

    const localClientId = import.meta.env.VITE_TDX_CLIENT_ID;
    const localClientSecret = import.meta.env.VITE_TDX_CLIENT_SECRET;

    // Use local credentials if available (Good for localhost development)
    if (localClientId && localClientSecret && localClientSecret !== 'your_client_secret_here') {
        return fetchTokenDirectly(localClientId, localClientSecret);
    }

    // Otherwise, assume we are in production and use the backend proxy
    return fetchTokenFromProxy();
};

// 1. Direct Client-Side Fetch (Dev Mode Only - Unsafe for Production)
async function fetchTokenDirectly(clientId, clientSecret) {
    try {
        console.log("Attempting Direct TDX Auth...");
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Direct Auth Failed: ${response.status} ${errText}`);
        }

        const data = await response.json();

        if (!data || !data.access_token) {
            console.error("TDX Auth Response Missing Token:", data);
            throw new Error("TDX returned success but no access_token found.");
        }

        setSession(data);
        return data.access_token;
    } catch (err) {
        console.error("Local Auth Error:", err);
        throw err;
    }
}

// 2. Serverless Proxy Fetch (Protection Mode)
async function fetchTokenFromProxy() {
    try {
        // Calls /api/token (Vercel Function)
        const response = await fetch('/api/token');
        if (!response.ok) throw new Error(`Proxy Auth Failed: ${response.status}`);

        const data = await response.json();
        setSession(data);
        return data.access_token;
    } catch (err) {
        console.error("Proxy Auth Error:", err);
        // Important: If this fails, the app cannot get data.
        throw err;
    }
}

function setSession(data) {
    accessToken = data.access_token;
    tokenExpiration = Date.now() + (data.expires_in * 1000);
}
