/**
 * Service to handle Route ID to Route Name mapping.
 * Ideally, this would query the TDX API.
 */

// Mapping Structure: RouteID -> { name, dest0 (GoBack=0), dest1 (GoBack=1) }
const routeCache = {
    // Common Routes
    '10832': { name: '307', dest0: '撫遠街', dest1: '板橋' },
    '104170': { name: '262區', dest0: '民生社區', dest1: '中和' },
    '109610': { name: '299', dest0: '永春高中', dest1: '輔大' },
    '161157': { name: '265區', dest0: '行政院', dest1: '重慶國中' },
    '161408': { name: '651', dest0: '臺北市政府', dest1: '板橋' },
    '10711': { name: '204', dest0: '東園', dest1: '麥帥新城' },
    '15341': { name: '604', dest0: '民生社區', dest1: '板橋' },
    '11752': { name: '307(經西藏路)', dest0: '撫遠街', dest1: '板橋' }, // Variant example

    // Fallback for demo purposes (adding a few more visible in logs)
    '10325': { name: '234', dest0: '西門', dest1: '板橋' }
};

/**
 * Get route information (Name, Destinations) by Route ID.
 * @param {string} routeId 
 * @returns {object} { name, dest0, dest1 }
 */
export const getRouteInfo = (routeId) => {
    if (routeCache[routeId]) {
        return routeCache[routeId];
    }
    // Default fallback if unknown
    return {
        name: routeId,
        dest0: '去程 (Outbound)',
        dest1: '返程 (Inbound)'
    };
};

export const getRouteName = (routeId) => {
    return routeCache[routeId]?.name || routeId;
};

export const searchRouteName = async (routeId) => {
    // Placeholder for future API integration
    return getRouteName(routeId);
};
