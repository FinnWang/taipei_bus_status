import React from 'react';

const ControlPanel = ({ loading, loadData, lastUpdated, filter, setFilter }) => {
    return (
        <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={loadData} disabled={loading}>
                {loading ? '更新中...' : '立即更新'}
            </button>
            <span className="refresh-timer">
                最後更新: {lastUpdated || 'Never'}
            </span>
            <input
                type="text"
                placeholder="搜尋路線 (e.g. 307) 或車號..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'white',
                    width: '250px'
                }}
            />
        </div>
    );
};

export default ControlPanel;
