// --- Bike Finance App - Frontend (Deployment Ready) ---
// This version uses the live API_URL in its child components.

import React, { useState } from 'react';
import CustomerList from './CustomerList';
import CreateLoanForm from './CreateLoanForm';
import LoanList from './LoanList';
import RecordPaymentModal from './RecordPaymentModal';
import Dashboard from './Dashboard';
import RecoveryNotice from './RecoveryNotice';
import CustomerProfile from './CustomerProfile';
import Noc from './Noc';
import EditCustomerForm from './EditCustomerForm';
import API_URL from './apiConfig'; // Import the live API URL
import './App.css';

// AddCustomerForm component is updated to use the live API_URL
const AddCustomerForm = ({ setView }) => {
  const [formData, setFormData] = useState({ full_name: '', mobile_number: '', email: '', permanent_address: '', current_address: '', aadhaar_number: '', pan_card: '', driving_license: '', occupation: '', monthly_income: '', employer_details: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData({ ...formData, [name]: value }); };
  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(''); setIsError(false);
    try {
      const response = await fetch(`${API_URL}/api/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Something went wrong');
      setMessage(result.message);
      setTimeout(() => setView('listCustomers'), 1500);
    } catch (error) { setMessage(error.message); setIsError(true); }
  };
  return (
    <div className="form-container">
      <h2>Add New Customer</h2>
      <form onSubmit={handleSubmit} className="customer-form modern-form">
        <div className="form-card">
            <h3>Personal & Contact Details</h3>
            <div className="form-grid">
                <div className="form-group"><label>Full Name *</label><input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Mobile Number *</label><input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} /></div>
                <div className="form-group full-width"><label>Permanent Address *</label><textarea name="permanent_address" value={formData.permanent_address} onChange={handleInputChange} required></textarea></div>
                <div className="form-group full-width"><label>Current Address (if different)</label><textarea name="current_address" value={formData.current_address} onChange={handleInputChange}></textarea></div>
            </div>
        </div>
        <div className="form-card">
            <h3>Identity & Employment</h3>
            <div className="form-grid">
                <div className="form-group"><label>Aadhaar Number *</label><input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>PAN Card *</label><input type="text" name="pan_card" value={formData.pan_card} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Driving License</label><input type="text" name="driving_license" value={formData.driving_license} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Occupation</label><input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Monthly Income</label><input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleInputChange} /></div>
                <div className="form-group full-width"><label>Employer Details</label><textarea name="employer_details" value={formData.employer_details} onChange={handleInputChange}></textarea></div>
            </div>
        </div>
        <button type="submit" className="submit-btn">Add Customer</button>
      </form>
      {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
};

// Main App component
function App() {
  const [view, setView] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateLoanClick = (customer) => {
    setSelectedCustomerId(customer.id);
    setView('createLoan');
  };

  const handleRecordPaymentClick = (loan) => {
    setSelectedLoan(loan);
    setIsPaymentModalOpen(true);
  };

  const handleGenerateNoticeClick = (loan) => {
    setSelectedLoan(loan);
    setView('recoveryNotice');
  };

  const handleViewProfileClick = (customerId) => {
    setSelectedCustomerId(customerId);
    setView('customerProfile');
  };

  const handleGenerateNocClick = (loan) => {
    setSelectedLoan(loan);
    setView('noc');
  };

  const handleEditCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setView('editCustomer');
  };

  const renderView = () => {
    switch (view) {
      case 'addCustomer':
        return <AddCustomerForm setView={setView} />;
      case 'createLoan':
        return <CreateLoanForm customer={{ id: selectedCustomerId }} setView={setView} />;
      case 'listCustomers':
        return <CustomerList onSelectCustomer={handleCreateLoanClick} onViewProfile={handleViewProfileClick} />;
      case 'listLoans':
        return <LoanList key={refreshKey} onRecordPayment={handleRecordPaymentClick} onGenerateNotice={handleGenerateNoticeClick} onViewProfile={handleViewProfileClick} onGenerateNoc={handleGenerateNocClick} />;
      case 'recoveryNotice':
        return <RecoveryNotice loan={selectedLoan} setView={setView} />;
      case 'customerProfile':
        return <CustomerProfile customerId={selectedCustomerId} setView={setView} onEditCustomer={handleEditCustomerClick} />;
      case 'noc':
        return <Noc loan={selectedLoan} setView={setView} />;
      case 'editCustomer':
        return <EditCustomerForm customer={selectedCustomer} setView={setView} onUpdateSuccess={(updatedCustomer) => {
            setSelectedCustomer(updatedCustomer);
            setRefreshKey(oldKey => oldKey + 1);
        }} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="container">
      {isPaymentModalOpen && (
        <RecordPaymentModal
          loan={selectedLoan}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={() => {
            setRefreshKey(oldKey => oldKey + 1);
          }}
        />
      )}
      <header>
        <h1>Bike Finance Manager</h1>
        <nav>
          <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>Dashboard</button>
          <button onClick={() => setView('listLoans')} className={view === 'listLoans' ? 'active' : ''}>View Loans</button>
          <button onClick={() => setView('listCustomers')} className={view === 'listCustomers' ? 'active' : ''}>View Customers</button>
          <button onClick={() => setView('addCustomer')} className={view === 'addCustomer' ? 'active' : ''}>Add New Customer</button>
        </nav>
      </header>
      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;
