// --- RecordPaymentModal Component ---
// This component is a pop-up form to record a new payment for a loan.

import React, { useState } from 'react';

function RecordPaymentModal({ loan, onClose, onPaymentSuccess }) {
  const [amountPaid, setAmountPaid] = useState(parseFloat(loan.emi_amount).toFixed(2));
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_id: loan.id,
          amount_paid: amountPaid,
          payment_mode: paymentMode,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Something went wrong');

      setMessage(result.message);
      onPaymentSuccess(); // This will trigger a refresh of the loan list
      setTimeout(onClose, 1500); // Close the modal after a short delay

    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">&times;</button>
        <h2>Record Payment for: {loan.loan_agreement_number}</h2>
        <p>Customer: <strong>{loan.customer_name}</strong></p>
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Amount Paid (₹) *</label>
            <input
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Mode *</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} required>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">Confirm Payment</button>
        </form>
        {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
      </div>
    </div>
  );
}

export default RecordPaymentModal;
