import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Bus, Armchair, AlertCircle, Clock } from 'lucide-react';

const COLORS = {
    green: '#10b981', // Enjoyable/Empty
    yellow: '#f59e0b', // Moderate
    red: '#ef4444',   // Crowded
    gray: '#6b7280'    // Unknown
};

const DashboardCharts = ({ data }) => {
    // 1. Process Data for Pie Chart (Crowding Distribution)
    const crowdingStats = data.reduce((acc, bus) => {
        // Level: 0=Enjoyable (Green), 1=Comfortable (Green), 2=Crowded (Yellow), 3=Full (Red)
        // Adjust logic based on real API observation or assumption
        // For TstBusSeatEvent: Level 0,1 usually ok, 2+ crowded.
        // Let's group: 0-1 (Green), 2 (Yellow), 3+ (Red)
        let key = 'unknown';
        const level = parseInt(bus.Level);
        if (level === 0 || level === 1) key = 'comfortable';
        else if (level === 2) key = 'moderate';
        else if (level >= 3) key = 'crowded';
        else key = 'unknown';

        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const pieData = [
        { name: '舒適 (Comfortable)', value: crowdingStats.comfortable || 0, color: COLORS.green },
        { name: '普通 (Moderate)', value: crowdingStats.moderate || 0, color: COLORS.yellow },
        { name: '擁擠 (Crowded)', value: crowdingStats.crowded || 0, color: COLORS.red },
    ].filter(d => d.value > 0);

    // 2. Process Data for Bar Chart (Top 5 Routes by Avg Availability) - Simplified to just "Most Buses per Route" for now to show activity
    // Or better: "Routes with most seats available"
    const routeSeats = data.reduce((acc, bus) => {
        const route = bus.RouteID;
        if (!acc[route]) acc[route] = { route, totalSeats: 0, count: 0 };
        // RemainingNum might be missing
        const seats = bus.RemainingNum !== undefined ? parseInt(bus.RemainingNum) : 0;
        acc[route].totalSeats += seats;
        acc[route].count += 1;
        return acc;
    }, {});

    const barData = Object.values(routeSeats)
        .map(r => ({ ...r, avgSeats: Math.round(r.totalSeats / r.count) }))
        .sort((a, b) => b.totalSeats - a.totalSeats)
        .slice(0, 5);

    // 3. Stat Cards Data
    const totalBuses = data.length;
    // Stale > 3 mins
    const threeMinsAgo = new Date(Date.now() - 3 * 60 * 1000);
    const staleCount = data.filter(d => new Date(d.DataTime) < threeMinsAgo).length;
    const totalSeats = data.reduce((sum, bus) => sum + (parseInt(bus.RemainingNum) || 0), 0);

    return (
        <div className="dashboard-charts">
            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue"><Bus size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">營運中公車 (Active Buses)</span>
                        <span className="stat-value">{totalBuses}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green"><Armchair size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">總剩餘座位 (Total Seats)</span>
                        <span className="stat-value">{totalSeats}</span>
                    </div>
                </div>
                {staleCount > 0 && (
                    <div className="stat-card">
                        <div className="stat-icon bg-red"><AlertCircle size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-label">以過時資料 (Stale Data)</span>
                            <span className="stat-value warning">{staleCount}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="charts-container">
                {/* Pie Chart */}
                <div className="chart-card">
                    <h3>擁擠度分佈 (Crowding Status)</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="chart-card">
                    <h3>座位最多路線 (Routes w/ Most Seats)</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="route" type="category" width={50} />
                                <Tooltip />
                                <Bar dataKey="totalSeats" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total Seats" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
