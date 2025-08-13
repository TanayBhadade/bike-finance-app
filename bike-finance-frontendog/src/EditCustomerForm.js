// --- EditCustomerForm Component ---
// This component displays a form to edit an existing customer's details.

import React, { useState, useEffect } from 'react';

function EditCustomerForm({ customer, setView, onUpdateSuccess }) {
  const [formData, setFormData] = useState({ ...customer });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // This ensures the form updates if the customer prop changes
  useEffect(() => {
    setFormData({ ...customer });
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT', // Use the PUT method for updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Something went wrong');

      setMessage(result.message);
      onUpdateSuccess(result.customer); // Pass the updated customer data back
      setTimeout(() => setView('customerProfile'), 1500); // Go back to the profile view

    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Edit Customer: {customer.full_name}</h2>
      <form onSubmit={handleSubmit} className="customer-form">
        {/* The form is pre-filled with the customer's data */}
        <div className="form-group"><label>Full Name *</label><input type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Mobile Number *</label><input type="text" name="mobile_number" value={formData.mobile_number || ''} onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Permanent Address *</label><textarea name="permanent_address" value={formData.permanent_address || ''} onChange={handleInputChange} required></textarea></div>
        <div className="form-group"><label>Current Address</label><textarea name="current_address" value={formData.current_address || ''} onChange={handleInputChange}></textarea></div>
        <div className="form-group"><label>Occupation</label><input type="text" name="occupation" value={formData.occupation || ''} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Monthly Income</label><input type="number" name="monthly_income" value={formData.monthly_income || ''} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Employer Details</label><textarea name="employer_details" value={formData.employer_details || ''} onChange={handleInputChange}></textarea></div>

        <div className="form-actions">
            <button type="button" onClick={() => setView('customerProfile')} className="action-btn back-btn">Cancel</button>
            <button type="submit" className="submit-btn">Save Changes</button>
        </div>
      </form>
      {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
}

export default EditCustomerForm;
