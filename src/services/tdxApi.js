
import { getAuthToken } from '../utils/auth';

const BASE_URL = "https://tdx.transportdata.tw/api/basic";

/**
 * Generic fetch wrapper for TDX API
 * @param {string} endpoint - API Endpoint like '/v2/Bus/RealTimeByFrequency/City/Taipei'
 * @param {object} params - Query parameters
 */
const fetchTDX = async (endpoint, params = {}) => {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("Missing TDX Credentials");
    }

    const queryString = new URLSearchParams({
        $format: 'JSON',
        ...params
    }).toString();

    const url = `${BASE_URL}${endpoint}?${queryString}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`TDX API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

/**
 * Fetch Real-time Bus Data (Location & Status)
 * @param {string} city - 'Taipei' or 'NewTaipei' (Default: Taipei)
 */
export const fetchBusLocations = async (city = 'Taipei') => {
    // /v2/Bus/RealTimeByFrequency/City/{City}
    // This endpoint provides bus location and some status info
    return fetchTDX(`/v2/Bus/RealTimeByFrequency/City/${city}`);
};

/**
 * Fetch Bus Routes (Shapes, Stops) - Good for mapping
 * @param {string} city 
 * @param {string} routeName - Optional filter
 */
export const fetchRouteShapes = async (city = 'Taipei', routeName = '') => {
    const params = {};
    if (routeName) {
        params['$filter'] = `RouteName/Zh_tw eq '${routeName}'`;
    }
    return fetchTDX(`/v2/Bus/Shape/City/${city}`, params);
};

export const fetchRouteStops = async (city = 'Taipei', routeName = '') => {
    const params = {};
    if (routeName) {
        params['$filter'] = `RouteName/Zh_tw eq '${routeName}'`;
    }
    return fetchTDX(`/v2/Bus/StopOfRoute/City/${city}`, params);
}
