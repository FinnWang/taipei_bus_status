/**
 * Service to fetch Taipei City Bus Onboard Crowding Data
 * API endpoint: https://tcgbusfs.blob.core.windows.net/blobbus/TstBusSeatEvent.json
 */

const API_URL = "https://tcgbusfs.blob.core.windows.net/blobbus/TstBusSeatEvent.json";

// Mapping crowding levels (inferred logic, to be verified)
// 0, 1, 2, 3 might map to different states.
// Based on general knowledge of these APIs:
// We will return the raw data and let the component handle the display logic for now,
// or normalize it here if we discover the exact mapping.
// According to research: 
// The API returns an array of bus objects.
// We'll add a helper to parse status.

export const fetchBusData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawData = await response.json();

    // Normalize data structure
    return rawData.map(item => ({
      ...item,
      // Ensure key fields exist and are strings
      RouteID: String(item.RouteID || 'Unknown'),
      BusID: String(item.BusID || 'Unknown'),
      ProviderID: String(item.ProviderID || 'Unknown'),
      DataTime: item.DataTime || new Date().toISOString(),
      RemainingNum: item.RemainingNum, // Keep raw, handle display in component
      Level: item.Level ?? -1 // Default to -1 if missing
    }));
  } catch (error) {
    console.error("Error fetching bus data:", error);
    throw error;
  }
};

/**
 * Helper to determine color based on crowding value (if available).
 * Since the exact field might be 'BusStatus' or inferred, we will interpret the available fields.
 * Wait, the research said "Crowding... usually maps to a value".
 * Let's assume we need to inspect the data first.
 * For now, we will return a default color or map known fields.
 */
