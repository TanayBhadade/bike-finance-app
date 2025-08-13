// --- Noc Component ---
// This component fetches data for a closed loan and displays a No Objection Certificate.

import React, { useState, useEffect } from 'react';

function Noc({ loan, setView }) {
  const [nocData, setNocData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loan) return;

    const fetchNocData = async () => {
      try {
        const response = await fetch(`/api/noc/${loan.id}`);
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'Failed to fetch NOC details.');
        }
        const data = await response.json();
        setNocData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNocData();
  }, [loan]);

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN') : 'N/A';

  if (loading) {
    return <div>Generating NOC...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!nocData) {
    return <div>No data available to generate NOC.</div>;
  }

  return (
    <div className="recovery-notice-container noc-container">
      <div className="notice-header">
        <h2>NO OBJECTION CERTIFICATE (NOC)</h2>
        <button onClick={() => window.print()} className="action-btn print-btn">Print NOC</button>
      </div>

      <div className="notice-section">
        <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
        <p><strong>Certificate No:</strong> NOC-{loan.id}-{new Date().getFullYear()}</p>
      </div>

      <div className="notice-statement">
        <p>This is to certify that <strong>{nocData.customer_name}</strong>, residing at {nocData.customer_address}, has successfully paid all outstanding dues against the loan account <strong>{nocData.loan_agreement_number}</strong>.</p>
        <p>The loan was taken for the vehicle with the following details:</p>
        <ul>
            <li><strong>Vehicle:</strong> {nocData.brand} {nocData.model}</li>
            <li><strong>Registration No:</strong> {nocData.registration_number}</li>
            <li><strong>Engine No:</strong> {nocData.engine_number}</li>
            <li><strong>Chassis No:</strong> {nocData.chassis_number}</li>
        </ul>
        <p>The account was officially closed on <strong>{formatDate(nocData.closure_date)}</strong>. We have no objection to the removal of our hypothecation from the registration certificate of the said vehicle.</p>
      </div>

      <div className="notice-footer">
        <p>For, [Your Company Name]</p>
        <br /><br />
        <p>_________________________</p>
        <p>(Authorized Signatory)</p>
      </div>

      <button onClick={() => setView('listLoans')} className="action-btn back-btn">Back to Loan List</button>
    </div>
  );
}

export default Noc;
