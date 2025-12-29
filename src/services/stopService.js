/**
 * Service to handle Stop ID to Name mapping.
 * In a real application, this would call the TDX Bus Stop API.
 * For this demo, we simulate it with a dictionary of stops observed in the Route 307/262 data.
 */

// Sample data mined from common Taipei bus routes
const stopCache = {
    // Route 307 Stops (Sample)
    '11752': '捷運板橋站',
    '11730': '板橋公車站',
    '11735': '新北市政府', // New Taipei City Hall
    '11749': '環球購物中心', // Global Mall
    '11716': '積穗',
    '11700': '員山',
    '11706': '中和高中',
    '11745': '連城路',
    '11722': '華中橋',
    '11725': '果菜市場',

    // Route 262 Stops (Sample)
    '36032': '民生社區',
    '36100': '長庚醫院',
    '36063': '臺北小巨蛋', // Taipei Arena
    '36054': '忠孝敦化路口',
    '129829': '捷運忠孝復興站',

    // Generic / Placeholder
    'unknown': '未知站牌'
};

/**
 * Get the name of a stop by its ID.
 * @param {string} stopId 
 * @returns {string} The stop name or the ID if not found.
 */
export const getStopName = (stopId) => {
    if (!stopId) return '';
    return stopCache[stopId] || `${stopId} (站名未知)`;
};
