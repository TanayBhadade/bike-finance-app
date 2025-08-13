// --- Dashboard Component (Deployment Ready) ---
// This version uses the live API_URL.

import React, { useState, useEffect } from 'react';
import API_URL from './apiConfig'; // Import the live API URL

// A simple SVG icon component for the cards
const StatIcon = ({ children }) => (
  <div className="stat-icon">{children}</div>
);

function Dashboard() {
  const [stats, setStats] = useState({
    active_loans: 0,
    total_outstanding: 0,
    collections_today: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use the live API_URL in the fetch call
        const response = await fetch(`${API_URL}/api/dashboard`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    // A simple loading skeleton
    return (
        <div className="stats-grid">
            <div className="stat-card skeleton"></div>
            <div className="stat-card skeleton"></div>
            <div className="stat-card skeleton"></div>
        </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Helper to format numbers as Indian currency
  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(number);
  };

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card collections">
          <StatIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </StatIcon>
          <div className="stat-info">
            <h3>Collections Today</h3>
            <p>{formatCurrency(stats.collections_today)}</p>
          </div>
        </div>
        <div className="stat-card active-loans">
          <StatIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
          </StatIcon>
          <div className="stat-info">
            <h3>Active Loans</h3>
            <p>{stats.active_loans}</p>
          </div>
        </div>
        <div className="stat-card outstanding">
          <StatIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </StatIcon>
          <div className="stat-info">
            <h3>Total Outstanding</h3>
            <p>{formatCurrency(stats.total_outstanding)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
