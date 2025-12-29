import { useState, useEffect } from 'react'
import './index.css' // Import first
import './App.css'   // Import app specific overrides
import { fetchBusData } from './services/api'
import ControlPanel from './components/ControlPanel'
import BusTable from './components/BusTable'
import DashboardCharts from './components/DashboardCharts'
import { getRouteName } from './services/routeService'
import { getProviderName, normalizeSearchText } from './utils/formatters'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filter, setFilter] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await fetchBusData()
      setData(result)
      setLastUpdated(new Date().toLocaleTimeString('zh-TW'))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 20000) // Poll every 20 seconds
    return () => clearInterval(interval)
  }, [])

  // Enhanced filtering
  const filteredData = data.filter(bus => {
    const search = normalizeSearchText(filter.toLowerCase());
    return (
      String(bus.RouteID || '').toLowerCase().includes(search) ||
      String(bus.BusID || '').toLowerCase().includes(search) ||
      String(bus.ProviderID || '').includes(search) ||
      getRouteName(bus.RouteID).toLowerCase().includes(search) ||
      getProviderName(bus.ProviderID).includes(search)
    );
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

      {/* Error State */}
      {error && (
        <div style={{ color: 'var(--danger-color)', padding: '1rem', border: '1px solid var(--danger-color)', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fee2e2' }}>
          讀取失敗: {error}
        </div>
      )}

      {/* Data Visualization */}
      <BusTable data={filteredData} loading={loading} />

      <div style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        資料來源: 臺北市資料大平臺 (Data.Taipei) | 自動更新: 每 20 秒
      </div>
    </div>
  )
}

export default App
