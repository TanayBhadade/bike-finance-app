// --- CustomerList Component (with Clickable Name) ---

import React, { useState, useEffect } from 'react';

function CustomerList({ onSelectCustomer, onViewProfile }) { // Add new prop
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchCustomers = async () => {
        try {
          const response = await fetch(`/api/customers?search=${searchTerm}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setCustomers(data);
        } catch (err) {
          setError('Failed to fetch customers.');
          console.error(err);
        }
      };
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="customer-list-container">
      <div className="list-header">
        <h2>All Customers</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <table className="customer-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Mobile Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>
                  {/* Make the name a clickable link */}
                  <a href="#" onClick={(e) => { e.preventDefault(); onViewProfile(customer.id); }} className="profile-link">
                    {customer.full_name}
                  </a>
                </td>
                <td>{customer.mobile_number}</td>
                <td>
                  <button onClick={() => onSelectCustomer(customer)} className="action-btn">
                    Create Loan
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No customers found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerList;
