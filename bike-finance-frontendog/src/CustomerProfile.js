// --- CustomerProfile Component (Upgraded UI) ---
// This version uses a more professional and visual two-column layout.

import React, {useState,useEffect} from 'react';

function CustomerProfile({ customerId, setView, onEditCustomer }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/customer/${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch customer profile.');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [customerId]);

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN') : 'N/A';
  const formatCurrency = (number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(number || 0);

  if (loading) return <div>Loading Profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  const { customer, loan, vehicle, guarantor, payments } = profile;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-title">
          <div className="profile-avatar">{customer.full_name.charAt(0)}</div>
          <h2>{customer.full_name}'s Profile</h2>
        </div>
        <div className="profile-actions">
            <button onClick={() => onEditCustomer(customer)} className="action-btn edit-btn">Edit Details</button>
            <button onClick={() => setView('listCustomers')} className="action-btn back-btn">Back to List</button>
        </div>
      </div>

      <div className="profile-grid-new">
        <div className="profile-main-content">
            {/* Loan & Vehicle Details Card */}
            {loan && vehicle && (
              <div className="profile-card">
                <h3>Loan & Vehicle Summary</h3>
                <div className="detail-grid">
                    <p><strong>Status:</strong> <span className={`status-badge status-${loan.status.toLowerCase()}`}>{loan.status}</span></p>
                    <p><strong>Outstanding:</strong> {formatCurrency(loan.principal_outstanding)}</p>
                    <p><strong>EMI Amount:</strong> {formatCurrency(loan.emi_amount)}</p>
                    <p><strong>Next Due Date:</strong> {formatDate(loan.next_due_date)}</p>
                    <p><strong>Vehicle:</strong> {vehicle.brand} {vehicle.model}</p>
                    <p><strong>Registration:</strong> {vehicle.registration_number}</p>
                </div>
              </div>
            )}
            {/* Payment History Table */}
            <div className="profile-card">
                <h3>Payment History</h3>
                {payments.length > 0 ? (
                <table className="customer-table payment-table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount Paid</th>
                        <th>Mode</th>
                    </tr>
                    </thead>
                    <tbody>
                    {payments.map(p => (
                        <tr key={p.id}>
                        <td>{formatDate(p.payment_date)}</td>
                        <td>{formatCurrency(p.amount_paid)}</td>
                        <td>{p.payment_mode}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                ) : <p>No payments recorded yet.</p>}
            </div>
        </div>
        <div className="profile-sidebar">
            {/* Customer Details Card */}
            <div className="profile-card">
              <h3>Personal Details</h3>
              <p><strong>Mobile:</strong> {customer.mobile_number}</p>
              <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
              <p><strong>PAN:</strong> {customer.pan_card}</p>
              <p><strong>Aadhaar:</strong> {customer.aadhaar_number}</p>
              <p><strong>Address:</strong> {customer.permanent_address}</p>
            </div>
            {/* Guarantor Details Card */}
            {guarantor && (
                <div className="profile-card">
                    <h3>Guarantor Details</h3>
                    <p><strong>Name:</strong> {guarantor.full_name}</p>
                    <p><strong>Mobile:</strong> {guarantor.mobile_number}</p>
                    <p><strong>Address:</strong> {guarantor.address}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;
