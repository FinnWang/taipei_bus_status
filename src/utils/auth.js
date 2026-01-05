
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

    const clientId = import.meta.env.VITE_TDX_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_TDX_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("TDX Client ID or Secret is missing. Please check your .env file.");
        // Return null or throw error depending on how we want to handle it.
        // For now, returning null to allow graceful degradation (UI can show "setup needed")
        return null;
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const errDetails = await response.text();
            throw new Error(`Failed to obtain TDX token: ${response.status} ${errDetails}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        // expires_in is in seconds
        tokenExpiration = Date.now() + (data.expires_in * 1000);

        return accessToken;
    } catch (error) {
        console.error("TDX Auth Error:", error);
        throw error;
    }
};
