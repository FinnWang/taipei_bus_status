import React, { useState } from 'react';
import { getCrowdingInfo, formatTimeAgo, getProviderName, isStale } from '../utils/formatters';
import { getRouteInfo } from '../services/routeService';
import { getStopName } from '../services/stopService';

const BusTable = ({ data, loading }) => {
    const [sortField, setSortField] = useState('RouteID');
    const [sortAsc, setSortAsc] = useState(true);

    // Sorting Logic
    const sortedData = [...data].sort((a, b) => {
        let valA, valB;

        switch (sortField) {
            case 'RouteID':
                valA = a.RouteID;
                valB = b.RouteID;
                break;
            case 'Crowding':
                // Sort by level descending (crowded first)
                valA = a.Level;
                valB = b.Level;
                break;
            case 'Seats':
                // Sort by seats ascending (fewer seats first)
                valA = a.RemainingNum || 999;
                valB = b.RemainingNum || 999;
                break;
            case 'Time':
                valA = new Date(a.DataTime).getTime();
                valB = new Date(b.DataTime).getTime();
                break;
            default:
                valA = a.RouteID;
                valB = b.RouteID;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });

    const handleHeaderClick = (field) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(true);
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '';
        return sortAsc ? ' ▲' : ' ▼';
    };

    if (loading && data.length === 0) {
        return <p>載入中...</p>;
    }

    if (!loading && data.length === 0) {
        return <p>目前沒有取得資料 (No data available).</p>;
    }

    return (
        <div className="card">
            <div className="table-container"> {/* Add wrapper for scrolling if needed */}
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleHeaderClick('RouteID')} style={{ cursor: 'pointer' }}>
                                路線 (Route) {getSortIcon('RouteID')}
                            </th>
                            <th>業者 (Provider)</th>
                            <th>車號 (Bus ID)</th>
                            <th>目前所在 (Current Stop)</th>
                            <th>開往 (Toward)</th>
                            <th onClick={() => handleHeaderClick('Crowding')} style={{ cursor: 'pointer' }}>
                                擁擠度 (Status) {getSortIcon('Crowding')}
                            </th>
                            <th onClick={() => handleHeaderClick('Seats')} style={{ cursor: 'pointer' }}>
                                剩餘座位 {getSortIcon('Seats')}
                            </th>
                            <th onClick={() => handleHeaderClick('Time')} style={{ cursor: 'pointer' }}>
                                更新時間 {getSortIcon('Time')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((bus, index) => {
                            const status = getCrowdingInfo(bus.Level);
                            const routeInfo = getRouteInfo(bus.RouteID);
                            // GoBack: 0=去程 (use dest0), 1=返程 (use dest1)
                            const destination = bus.GoBack === '0' ? routeInfo.dest0 : routeInfo.dest1;
                            const stopName = getStopName(bus.StopID);

                            const displayRoute = routeInfo.name === bus.RouteID ? bus.RouteID : `${routeInfo.name} (${bus.RouteID})`;
                            const providerName = getProviderName(bus.ProviderID);

                            const stale = isStale(bus.DataTime);
                            return (
                                <tr key={`${bus.BusID}-${index}`} className={stale ? 'stale-row' : ''} title={stale ? '資料已超過 3 分鐘未更新 (Stale Data)' : ''}>
                                    <td style={{ fontWeight: 'bold' }}>{displayRoute}</td>
                                    <td style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>{providerName}</td>
                                    <td style={{ color: 'var(--accent-color)' }}>{bus.BusID}</td>
                                    <td style={{ fontWeight: 'bold' }}>{stopName}</td>
                                    <td>
                                        <span style={{ fontSize: '0.9em', color: '#888' }}>往 </span>
                                        {destination}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td>
                                        {bus.RemainingNum !== undefined ? bus.RemainingNum : '-'}
                                    </td>
                                    <td style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                                        {formatTimeAgo(bus.DataTime)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right' }}>
                顯示 {sortedData.length} 筆資料
            </div>
        </div>
    );
};

export default BusTable;
