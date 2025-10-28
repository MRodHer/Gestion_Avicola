import React, { useState } from 'react';

interface DashboardProps {
  pastData: any; // Replace with actual data type
  recentData: any; // Replace with actual data type
}

const HybridDashboard: React.FC<DashboardProps> = ({ pastData, recentData }) => {
  const [viewMode, setViewMode] = useState<'past' | 'recent'>('recent');

  const handleToggle = (mode: 'past' | 'recent') => {
    setViewMode(mode);
  };

  const renderData = () => {
    if (viewMode === 'past') {
      return (
        <div>
          <h2>Past Data View</h2>
          {/* Render pastData here */}
          <pre>{JSON.stringify(pastData, null, 2)}</pre>
        </div>
      );
    } else {
      return (
        <div>
          <h2>Recent Data View</h2>
          {/* Render recentData here */}
          <pre>{JSON.stringify(recentData, null, 2)}</pre>
        </div>
      );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => handleToggle('past')}
          disabled={viewMode === 'past'}
          style={{ marginRight: '1rem' }}
        >
          View Past Data
        </button>
        <button
          onClick={() => handleToggle('recent')}
          disabled={viewMode === 'recent'}
        >
          View Recent Data
        </button>
      </div>
      {renderData()}
    </div>
  );
};

export default HybridDashboard;