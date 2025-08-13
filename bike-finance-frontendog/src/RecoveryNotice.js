// --- RecoveryNotice Component ---
// This component fetches data for a specific loan and displays a formal recovery notice.

import React, { useState, useEffect } from 'react';

function RecoveryNotice({ loan, setView }) {
  const [noticeData, setNoticeData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loan) return;

    const fetchRecoveryData = async () => {
      try {
        const response = await fetch(`/api/recovery/${loan.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recovery details.');
        }
        const data = await response.json();
        setNoticeData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecoveryData();
  }, [loan]);

  if (loading) {
    return <div>Generating Notice...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!noticeData) {
    return <div>No data available to generate notice.</div>;
  }

  // Helper to format numbers as Indian currency
  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(number);
  };

  return (
    <div className="recovery-notice-container">
      <div className="notice-header">
        <h2>RECOVERY NOTICE</h2>
        <button onClick={() => window.print()} className="action-btn print-btn">Print Notice</button>
      </div>

      <div className="notice-section">
        <h4>Customer Details:</h4>
        <p><strong>Name:</strong> {noticeData.customer_name}</p>
        <p><strong>Address:</strong> {noticeData.customer_address}</p>
        <p><strong>Mobile:</strong> {noticeData.customer_mobile}</p>
        <p><strong>Vehicle:</strong> {noticeData.vehicle_brand} {noticeData.vehicle_model} - {noticeData.vehicle_registration}</p>
      </div>

      {noticeData.guarantor_name && (
        <div className="notice-section">
          <h4>Guarantor Details:</h4>
          <p><strong>Name:</strong> {noticeData.guarantor_name}</p>
          <p><strong>Address:</strong> {noticeData.guarantor_address}</p>
          <p><strong>Mobile:</strong> {noticeData.guarantor_mobile}</p>
        </div>
      )}

      <div className="notice-section">
        <h4>Outstanding Details:</h4>
        <p><strong>Principal Outstanding:</strong> {formatCurrency(noticeData.principal_outstanding)}</p>
        <p><strong>Interest Due:</strong> {formatCurrency(noticeData.interest_outstanding || 0)}</p>
        <p><strong>Late Charges @ ₹0.004 per ₹1:</strong> {formatCurrency(noticeData.late_charges)}</p>
        <p><strong>Total Outstanding:</strong> {formatCurrency(noticeData.total_outstanding)}</p>
      </div>

      <div className="notice-statement">
        <h4>Recovery Statement:</h4>
        <p>
          This serves as a final notice for the recovery of outstanding dues against your vehicle loan.
          Despite multiple reminders, the payment has not been received. You are hereby requested to
          clear the outstanding amount within 7 days, failing which legal action will be initiated
          as per the loan agreement terms.
        </p>
      </div>

      <div className="notice-footer">
        <p><strong>Date:</strong> {noticeData.current_date}</p>
        <p><strong>Recovery Officer:</strong> [Your Name/Company Name]</p>
        <p><strong>Contact:</strong> [Your Phone/Email]</p>
      </div>

      <button onClick={() => setView('listLoans')} className="action-btn back-btn">Back to Loan List</button>
    </div>
  );
}

export default RecoveryNotice;
