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
                valA = a.Level;
                valB = b.Level;
                break;
            case 'Seats':
                // Treat undefined as extremely high (or low depending on sort goal), usually low availability is key
                // Let's treat undefined as -1 for sorting
                valA = a.RemainingNum !== undefined ? parseInt(a.RemainingNum) : -1;
                valB = b.RemainingNum !== undefined ? parseInt(b.RemainingNum) : -1;
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
        return <div className="loading-state">載入中...</div>;
    }

    if (!loading && data.length === 0) {
        return <div className="empty-state">目前沒有取得資料 (No data available).</div>;
    }

    return (
        <div className="card table-card">
            <div className="table-container">
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
                            <th onClick={() => handleHeaderClick('Seats')} style={{ cursor: 'pointer', minWidth: '120px' }}>
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
                            const destination = bus.GoBack === '0' ? routeInfo.dest0 : routeInfo.dest1;
                            const stopName = getStopName(bus.StopID);

                            const displayRoute = routeInfo.name === bus.RouteID ? bus.RouteID : `${routeInfo.name} (${bus.RouteID})`;
                            const providerName = getProviderName(bus.ProviderID);

                            const stale = isStale(bus.DataTime);
                            const remaining = bus.RemainingNum !== undefined ? parseInt(bus.RemainingNum) : null;

                            // Visual bar for seats (Assume max ~40 for a bus?)
                            const maxSeats = 40;
                            const seatPercent = remaining !== null ? Math.min((remaining / maxSeats) * 100, 100) : 0;
                            const seatColor = remaining > 20 ? 'var(--success-color)' : remaining > 5 ? 'var(--warning-color)' : 'var(--danger-color)';

                            return (
                                <tr key={`${bus.BusID}-${index}`} className={stale ? 'stale-row' : ''}>
                                    <td className="route-cell">{displayRoute}</td>
                                    <td><span className="provider-badge">{providerName}</span></td>
                                    <td className="bus-id">{bus.BusID}</td>
                                    <td className="stop-name">{stopName}</td>
                                    <td className="destination">
                                        <span className="arrow">➔ </span>
                                        {destination}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td>
                                        {remaining !== null ? (
                                            <div className="seat-indicator">
                                                <span className="seat-num">{remaining}</span>
                                                <div className="progress-bar-bg">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{ width: `${seatPercent}%`, backgroundColor: seatColor }}
                                                    />
                                                </div>
                                            </div>
                                        ) : <span className="no-data">-</span>}
                                    </td>
                                    <td className="time-cell">
                                        {stale && <span className="stale-icon" title="資料過時">⚠️</span>}
                                        {formatTimeAgo(bus.DataTime)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                顯示 {sortedData.length} 筆資料
            </div>
        </div>
    );
};

export default BusTable;
