// --- RecoveryNotice Component (Deployment Ready) ---
// This version uses the live API_URL.

import React, { useState, useEffect } from 'react';
import API_URL from './apiConfig'; // Import the live API URL

function RecoveryNotice({ loan, setView }) {
  const [noticeData, setNoticeData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loan) return;

    const fetchRecoveryData = async () => {
      try {
        // Use the live API_URL in the fetch call
        const response = await fetch(`${API_URL}/api/recovery/${loan.id}`);
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

  const formatCurrency = (number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(number || 0);

  if (loading) return <div>Generating Notice...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!noticeData) return <div>No data available to generate notice.</div>;

  return (
    <div className="document-page-container">
        <div className="document-actions">
            <button onClick={() => setView('listLoans')} className="action-btn back-btn">Back to Loan List</button>
            <button onClick={() => window.print()} className="action-btn print-btn">Print Notice</button>
        </div>
        <div className="document-paper">
            <div className="document-header">
                <div className="logo-placeholder">Your Logo Here</div>
                <h1>Recovery Notice</h1>
            </div>

            <div className="document-section">
                <p><strong>Date:</strong> {noticeData.current_date}</p>
            </div>

            <div className="document-section">
                <h4><u>Customer Details</u></h4>
                <p><strong>Name:</strong> {noticeData.customer_name}</p>
                <p><strong>Address:</strong> {noticeData.customer_address}</p>
                <p><strong>Vehicle:</strong> {noticeData.vehicle_brand} {noticeData.vehicle_model} ({noticeData.vehicle_registration})</p>
            </div>

            {noticeData.guarantor_name && (
                <div className="document-section">
                <h4><u>Guarantor Details</u></h4>
                <p><strong>Name:</strong> {noticeData.guarantor_name}</p>
                <p><strong>Address:</strong> {noticeData.guarantor_address}</p>
                </div>
            )}

            <div className="document-section">
                <h4><u>Subject: Final Notice for Recovery of Outstanding Dues</u></h4>
                <p>
                This serves as a final notice for the recovery of outstanding dues against your vehicle loan. Despite multiple reminders, the payment has not been received.
                </p>
            </div>


            <div className="document-section">
                <h4><u>Outstanding Amount</u></h4>
                <table className="summary-table">
                    <tbody>
                        <tr>
                            <td>Principal Outstanding:</td>
                            <td>{formatCurrency(noticeData.principal_outstanding)}</td>
                        </tr>
                        <tr>
                            <td>Interest Due:</td>
                            <td>{formatCurrency(noticeData.interest_outstanding || 0)}</td>
                        </tr>
                        <tr>
                            <td>Late Charges:</td>
                            <td>{formatCurrency(noticeData.late_charges)}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Outstanding:</strong></td>
                            <td><strong>{formatCurrency(noticeData.total_outstanding)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="document-section">
                 <p>
                 You are hereby requested to clear the total outstanding amount within <strong>7 (seven) days</strong> from the date of this notice, failing which legal action will be initiated as per the terms of your loan agreement, which may include repossession of the vehicle.
                </p>
            </div>

            <div className="document-footer">
                <p>Sincerely,</p>
                <div className="signature-area">
                    <p>_________________________</p>
                    <p>(Authorized Signatory)</p>
                    <p><strong>[Your Company Name]</strong></p>
                    <p><strong>Contact:</strong> [Your Phone/Email]</p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default RecoveryNotice;
