/**
 * Format a timestamp into a relative "X seconds ago" string.
 * @param {string} timestampStr - ISO timestamp string.
 * @returns {string} Relative time string.
 */
export const formatTimeAgo = (timestampStr) => {
    if (!timestampStr) return '-';
    const now = new Date();
    const date = new Date(timestampStr);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
        return date.toLocaleTimeString();
    }
};

/**
 * Check if the data is stale (older than 3 minutes).
 * @param {string} timestampStr 
 * @returns {boolean}
 */
export const isStale = (timestampStr) => {
    if (!timestampStr) return true;
    const now = new Date();
    const date = new Date(timestampStr);
    const diffInSeconds = (now - date) / 1000;
    return diffInSeconds > 180; // 3 minutes
};


/**
 * Get crowding level details including color/label.
 * Mapping based on V5.4 standard or observed values:
 * 0: Comfortable (Green)
 * 1: Normal (Yellow)
 * 2: Crowded (Orange)
 * 3: Full (Red)
 * 4: Critical (Dark Red)
 * @param {string|number} level 
 */
export const getCrowdingInfo = (level) => {
    const lvlStr = String(level);
    switch (lvlStr) {
        case '0':
            return { label: 'Comfortable', className: 'status-green', text: '舒適' };
        case '1':
            return { label: 'Normal', className: 'status-yellow', text: '普通' };
        case '2':
            return { label: 'Crowded', className: 'status-orange', text: '略擠' };
        case '3':
            return { label: 'Full', className: 'status-red', text: '擁擠' };
        case '4':
            return { label: 'Full', className: 'status-red', text: '客滿' };
        default:
            return { label: 'Unknown', className: 'status-badge', text: '未知' };
    }
};

/**
 * Map Provider ID to Name (common Taipei bus providers).
 * @param {string|number} providerId 
 */
export const getProviderName = (providerId) => {
    const providers = {
        '100': '臺北客運',
        '200': '大都會客運',
        '300': '中興巴士',
        '400': '光華巴士',
        '500': '大有巴士',
        '600': '大南汽車',
        '700': '欣欣客運',
        '800': '大好', // Commonly seen in sample data, might need verification
        '900': '指南客運',
        '5300': '統聯客運'
    };
    return providers[String(providerId)] || providerId;
};

/**
 * Normalize search text to handle common variants (e.g., 台 vs 臺).
 * @param {string} text 
 */
export const normalizeSearchText = (text) => {
    if (!text) return '';
    // Simple replacement: convert 台 to 臺, maybe others if needed
    return text.replace(/台/g, '臺');
};
