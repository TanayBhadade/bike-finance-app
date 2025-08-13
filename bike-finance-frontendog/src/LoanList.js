// --- LoanList Component (with Generate NOC button) ---

import React, { useState, useEffect } from 'react';

function LoanList({ onRecordPayment, onGenerateNotice, onViewProfile, onGenerateNoc }) {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch('/api/loans');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setLoans(data);
      } catch (err) {
        setError('Failed to fetch loans.');
        console.error(err);
      }
    };
    fetchLoans();
  }, []);

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="customer-list-container">
      <h2>All Loans</h2>
      <table className="customer-table">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Customer Name</th>
            <th>Outstanding (₹)</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.loan_agreement_number}</td>
              <td>
                <a href="#" onClick={(e) => { e.preventDefault(); onViewProfile(loan.customer_id); }} className="profile-link">
                    {loan.customer_name}
                </a>
              </td>
              <td>{parseFloat(loan.principal_outstanding).toFixed(2)}</td>
              <td><span className={`status-badge status-${loan.status.toLowerCase()}`}>{loan.status}</span></td>
              <td className="action-cell">
                {loan.status === 'Active' && (
                  <button onClick={() => onRecordPayment(loan)} className="action-btn record-payment">
                    Record Payment
                  </button>
                )}
                {isOverdue(loan.next_due_date) && loan.status === 'Active' && (
                  <button onClick={() => onGenerateNotice(loan)} className="action-btn generate-notice">
                    Generate Notice
                  </button>
                )}
                {loan.status === 'Closed' && (
                    <button onClick={() => onGenerateNoc(loan)} className="action-btn generate-noc">
                        Generate NOC
                    </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LoanList;
