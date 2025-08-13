// --- CreateLoanForm Component ---
// This component displays a form to create a new loan for a specific customer.

import React, { useState } from 'react';

function CreateLoanForm({ customer, setView }) {
  const [formData, setFormData] = useState({
    customer_id: customer.id, // Pre-fill the customer ID
    registration_number: '',
    brand: '',
    model: '',
    engine_number: '',
    chassis_number: '',
    purchase_date: '',
    total_financed_amount: '',
    down_payment_amount: '',
    interest_rate: '',
    tenure_months: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Something went wrong');
      setMessage(result.message);
      // On success, go back to the customer list after a short delay
      setTimeout(() => setView('list'), 2000);
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Loan for: {customer.full_name}</h2>
      <form onSubmit={handleSubmit} className="customer-form">
        <h3>Vehicle Details</h3>
        <div className="form-group"><label>Registration Number *</label><input type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Brand *</label><input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Model *</label><input type="text" name="model" value={formData.model} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Engine Number *</label><input type="text" name="engine_number" value={formData.engine_number} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Chassis Number *</label><input type="text" name="chassis_number" value={formData.chassis_number} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Purchase Date *</label><input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} required /></div>

        <h3>Loan Details</h3>
        <div className="form-group"><label>Total Financed Amount (₹) *</label><input type="number" name="total_financed_amount" value={formData.total_financed_amount} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Down Payment Amount (₹) *</label><input type="number" name="down_payment_amount" value={formData.down_payment_amount} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Annual Interest Rate (%) *</label><input type="number" step="0.01" name="interest_rate" value={formData.interest_rate} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Tenure (Months) *</label><input type="number" name="tenure_months" value={formData.tenure_months} onChange={handleInputChange} required /></div>

        <button type="submit" className="submit-btn">Create Loan</button>
      </form>
      {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
}

export default CreateLoanForm;
