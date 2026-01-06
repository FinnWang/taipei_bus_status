import { useState, useEffect } from 'react'
import './index.css' // Import first
import './App.css'   // Import app specific overrides
import { fetchBusData } from './services/api'
import { fetchBusLocations } from './services/tdxApi' // [NEW]
import ControlPanel from './components/ControlPanel'
import BusTable from './components/BusTable'
import BusMap from './components/BusMap' // [NEW]
import DashboardCharts from './components/DashboardCharts'
import { getRouteName } from './services/routeService'
import { getProviderName, normalizeSearchText } from './utils/formatters'

function App() {
  const [data, setData] = useState([]) // Crowding Data
  const [locations, setLocations] = useState([]) // [NEW] TDX Location Data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filter, setFilter] = useState('')

  const loadData = async () => {
    try {
      // Don't set loading to true on every poll to prevent UI flicker
      // only set if it's the initial load or explicit reload logic if needed
      if (data.length === 0) setLoading(true)

      // Parallel fetch: Crowding Data + Location Data
      const results = await Promise.allSettled([
        fetchBusData(),
        fetchBusLocations('Taipei')
      ]);

      const [crowdResult, locationResult] = results;

      if (crowdResult.status === 'fulfilled') {
        setData(crowdResult.value);
      } else {
        console.error("Crowd Data Error:", crowdResult.reason);
        // We can choose to show a partial error or just log it
      }

      if (locationResult.status === 'fulfilled') {
        setLocations(locationResult.value);
      } else {
        console.error("Location Data Error:", locationResult.reason);
        // Don't kill the whole app, just set generic error for notification
        setError(locationResult.reason?.message || "Location Data Unavailable");
      }

      setLastUpdated(new Date().toLocaleTimeString('zh-TW'));
      // Only clear error if we got at least SOME data
      if (crowdResult.status === 'fulfilled') {
        setError(null);
      }

    } catch (err) {
      console.error("Critical Data load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 20000) // Poll every 20 seconds
    return () => clearInterval(interval)
  }, [])

  // Enhanced filtering
  // Filter both lists based on search (Support multi-term: "307 262")
  const normalize = (str) => String(str || '').toLowerCase();

  const searchTerms = filter.toLowerCase().split(/[\s,]+/).filter(Boolean);

  const filteredData = data.filter(bus => {
    if (searchTerms.length === 0) return true;

    // OR logic: Show bus if it matches ANY of the search terms
    return searchTerms.some(term => {
      const s = normalizeSearchText(term);
      return (
        normalize(bus.RouteID).includes(s) ||
        normalize(bus.BusID).includes(s) ||
        normalize(bus.ProviderID).includes(s) ||
        getRouteName(bus.RouteID).toLowerCase().includes(s) ||
        getProviderName(bus.ProviderID).includes(s)
      );
    });
  });

  // Filter locations for map
  const filteredLocations = locations.filter(bus => {
    if (searchTerms.length === 0) return true;

    return searchTerms.some(term => {
      const s = normalizeSearchText(term);
      return (
        normalize(bus.RouteName?.Zh_tw).includes(s) ||
        normalize(bus.PlateNumb).includes(s)
      );
    });
  }).map(location => {
    // [NEW] Merge with Crowding Data
    const crowding = data.find(d => d.BusID === location.PlateNumb);
    return { ...location, CrowdingInfo: crowding };
  });

  return (
    <div className="container">
      <h1>臺北市公車擁擠度看板</h1>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
        Taipei City Bus Real-time Crowding Dashboard (V5.4 Compliant)
      </p>

      {/* 4. Statistics & Charts */}
      {data.length > 0 && <DashboardCharts data={data} />}

      <ControlPanel
        loading={loading}
        loadData={loadData}
        lastUpdated={lastUpdated}
        filter={filter}
        setFilter={setFilter}
      />

      {/* [NEW] Map Visualization */}
      {locations.length > 0 && (
        <BusMap busLocations={filteredLocations} />
      )}

      {/* Error State */}
      {error && (
        <div style={{ color: 'var(--danger-color)', padding: '1rem', border: '1px solid var(--danger-color)', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fee2e2' }}>
          讀取失敗: {error}
        </div>
      )}

      {/* Data Visualization */}
      <BusTable data={filteredData} loading={loading} />

      <div style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        資料來源: 臺北市資料大平臺 (Data.Taipei) & TDX | 自動更新: 每 20 秒
      </div>
    </div>
  )
}

export default App
