// --- Bike Finance App - Backend Server (Edit Customer) ---
// This version adds a new endpoint to edit an existing customer's details.

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'bike_finance_db',
    password: 'tanay', // <-- MAKE SURE THIS IS YOUR ACTUAL PASSWORD
    port: 2121,
};

const app = express();
const pool = new Pool(dbConfig);

app.use(cors());
app.use(express.json());

// --- All other endpoints remain the same ---
// ... (code for other endpoints is unchanged) ...
// GET all customers
app.get('/api/customers', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT id, full_name, mobile_number, email FROM customers';
        const values = [];
        if (search) {
            query += ' WHERE full_name ILIKE $1 OR mobile_number ILIKE $1';
            values.push(`%${search}%`);
        }
        query += ' ORDER BY created_at DESC';
        const { rows } = await pool.query(query, values);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'An error occurred while fetching customers.' });
    }
});
// POST a new customer
app.post('/api/customers', async (req, res) => {
    try {
        const { full_name, mobile_number, email, permanent_address, current_address, aadhaar_number, pan_card, driving_license, occupation, monthly_income, employer_details } = req.body;
        const newCustomerQuery = `INSERT INTO customers (full_name, mobile_number, email, permanent_address, current_address, aadhaar_number, pan_card, driving_license, occupation, monthly_income, employer_details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;
        const values = [full_name, mobile_number, email, permanent_address, current_address, aadhaar_number, pan_card, driving_license, occupation, monthly_income, employer_details];
        const result = await pool.query(newCustomerQuery, values);
        res.status(201).json({ message: 'Customer added successfully!', customer: result.rows[0] });
    } catch (error) {
        console.error('Error adding customer:', error);
        if (error.code === '23505') return res.status(409).json({ message: `A customer with this ${error.constraint.split('_')[1]} already exists.` });
        res.status(500).json({ message: 'An error occurred while adding the customer.' });
    }
});
// GET all loans
app.get('/api/loans', async (req, res) => {
    try {
        const query = `
            SELECT l.id, l.loan_agreement_number, l.emi_amount, l.principal_outstanding, l.status, l.next_due_date, c.full_name AS customer_name, c.id AS customer_id 
            FROM loans l JOIN customers c ON l.customer_id = c.id ORDER BY l.start_date DESC;`;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ message: 'An error occurred while fetching loans.' });
    }
});
// GET dashboard data
app.get('/api/dashboard', async (req, res) => {
    try {
        const statsQuery = `
            SELECT
                (SELECT COUNT(*) FROM loans WHERE status = 'Active') AS active_loans,
                (SELECT SUM(principal_outstanding) FROM loans WHERE status = 'Active') AS total_outstanding,
                (SELECT SUM(amount_paid) FROM payments WHERE DATE(payment_date) = CURRENT_DATE) AS collections_today;
        `;
        const { rows } = await pool.query(statsQuery);
        const data = { ...rows[0], collections_today: rows[0].collections_today || 0 };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'An error occurred while fetching dashboard data.' });
    }
});
// POST a new loan
app.post('/api/loans', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { customer_id, registration_number, brand, model, engine_number, chassis_number, purchase_date, total_financed_amount, down_payment_amount, interest_rate, tenure_months } = req.body;
        const vehicleQuery = `INSERT INTO vehicles (customer_id, registration_number, brand, model, engine_number, chassis_number, purchase_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`;
        const vehicleResult = await client.query(vehicleQuery, [customer_id, registration_number, brand, model, engine_number, chassis_number, purchase_date]);
        const newVehicleId = vehicleResult.rows[0].id;
        const principal = parseFloat(total_financed_amount);
        const monthlyRate = parseFloat(interest_rate) / 12 / 100;
        const tenure = parseInt(tenure_months);
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
        const loan_agreement_number = `LOAN-${Date.now()}-${customer_id}`;
        const start_date = new Date(purchase_date);
        const end_date = new Date(start_date);
        end_date.setMonth(end_date.getMonth() + tenure);
        const next_due_date = new Date(start_date);
        next_due_date.setMonth(next_due_date.getMonth() + 1);
        const loanQuery = `INSERT INTO loans (customer_id, vehicle_id, loan_agreement_number, total_financed_amount, down_payment_amount, interest_rate, tenure_months, emi_amount, start_date, end_date, principal_outstanding, next_due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`;
        const loanValues = [customer_id, newVehicleId, loan_agreement_number, total_financed_amount, down_payment_amount, interest_rate, tenure_months, emi.toFixed(2), start_date, end_date, total_financed_amount, next_due_date];
        const loanResult = await client.query(loanQuery, loanValues);
        await client.query('COMMIT');
        res.status(201).json({ message: 'Loan created successfully!', loan: loanResult.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating loan:', error);
        if (error.code === '23505') return res.status(409).json({ message: `A vehicle with this ${error.constraint.split('_')[1]} already exists.` });
        res.status(500).json({ message: 'An error occurred while creating the loan.' });
    } finally {
        client.release();
    }
});
// GET recovery data
app.get('/api/recovery/:loan_id', async (req, res) => {
    const { loan_id } = req.params;
    try {
        const query = `
            SELECT c.full_name AS customer_name, c.permanent_address AS customer_address, c.mobile_number AS customer_mobile, v.brand AS vehicle_brand, v.model AS vehicle_model, v.registration_number AS vehicle_registration, g.full_name AS guarantor_name, g.address AS guarantor_address, g.mobile_number AS guarantor_mobile, l.principal_outstanding, l.interest_outstanding, l.next_due_date
            FROM loans l JOIN customers c ON l.customer_id = c.id JOIN vehicles v ON l.vehicle_id = v.id LEFT JOIN guarantors g ON c.id = g.customer_id
            WHERE l.id = $1;
        `;
        const { rows } = await pool.query(query, [loan_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Loan not found.' });
        const data = rows[0];
        let late_charges = 0;
        const today = new Date();
        const dueDate = new Date(data.next_due_date);
        if (dueDate < today) {
            const days_overdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            late_charges = parseFloat(data.principal_outstanding) * 0.004 * days_overdue;
        }
        const recoveryData = { ...data, late_charges: late_charges.toFixed(2), total_outstanding: (parseFloat(data.principal_outstanding) + parseFloat(data.interest_outstanding || 0) + late_charges).toFixed(2), current_date: new Date().toLocaleDateString('en-IN') };
        res.status(200).json(recoveryData);
    } catch (error) {
        console.error('Error fetching recovery data:', error);
        res.status(500).json({ message: 'An error occurred while fetching recovery data.' });
    }
});
// POST a new payment
app.post('/api/payments', async (req, res) => {
    const { loan_id, amount_paid, payment_mode } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const loanDetailsResult = await client.query('SELECT principal_outstanding, emi_amount, status FROM loans WHERE id = $1', [loan_id]);
        if (loanDetailsResult.rows.length === 0) return res.status(404).json({ message: 'Loan not found.' });
        if (loanDetailsResult.rows[0].status === 'Closed') return res.status(400).json({ message: 'This loan is already closed. No more payments can be recorded.' });
        const currentOutstanding = parseFloat(loanDetailsResult.rows[0].principal_outstanding);
        const emiAmount = parseFloat(loanDetailsResult.rows[0].emi_amount);
        const paymentQuery = `INSERT INTO payments (loan_id, amount_paid, payment_mode) VALUES ($1, $2, $3) RETURNING *;`;
        await client.query(paymentQuery, [loan_id, amount_paid, payment_mode]);
        const newOutstanding = currentOutstanding - parseFloat(amount_paid);
        if (newOutstanding <= 0) {
            await client.query(`UPDATE loans SET principal_outstanding = 0, status = 'Closed', next_due_date = NULL WHERE id = $1;`, [loan_id]);
        } else {
            if (parseFloat(amount_paid) >= emiAmount) {
                await client.query(`UPDATE loans SET principal_outstanding = $1, next_due_date = next_due_date + INTERVAL '1 month' WHERE id = $2;`, [newOutstanding.toFixed(2), loan_id]);
            } else {
                await client.query(`UPDATE loans SET principal_outstanding = $1 WHERE id = $2;`, [newOutstanding.toFixed(2), loan_id]);
            }
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Payment recorded successfully!' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error recording payment:', error);
        res.status(500).json({ message: 'An error occurred while recording the payment.' });
    } finally {
        client.release();
    }
});
// GET full customer profile
app.get('/api/customer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const customerQuery = 'SELECT * FROM customers WHERE id = $1';
        const customerResult = await pool.query(customerQuery, [id]);
        if (customerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        const loanQuery = 'SELECT * FROM loans WHERE customer_id = $1 ORDER BY start_date DESC';
        const loanResult = await pool.query(loanQuery, [id]);
        const vehicleQuery = 'SELECT * FROM vehicles WHERE customer_id = $1';
        const vehicleResult = await pool.query(vehicleQuery, [id]);
        const guarantorQuery = 'SELECT * FROM guarantors WHERE customer_id = $1';
        const guarantorResult = await pool.query(guarantorQuery, [id]);
        const paymentQuery = 'SELECT * FROM payments WHERE loan_id = $1 ORDER BY payment_date DESC';
        const paymentsResult = loanResult.rows.length > 0
            ? await pool.query(paymentQuery, [loanResult.rows[0].id])
            : { rows: [] };
        const profileData = {
            customer: customerResult.rows[0],
            loan: loanResult.rows[0] || null,
            vehicle: vehicleResult.rows[0] || null,
            guarantor: guarantorResult.rows[0] || null,
            payments: paymentsResult.rows,
        };
        res.status(200).json(profileData);
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        res.status(500).json({ message: 'An error occurred while fetching the customer profile.' });
    }
});
// GET NOC data
app.get('/api/noc/:loan_id', async (req, res) => {
    const { loan_id } = req.params;
    try {
        const query = `
            SELECT 
                c.full_name AS customer_name, c.permanent_address AS customer_address,
                v.brand, v.model, v.registration_number, v.engine_number, v.chassis_number,
                l.loan_agreement_number, l.status,
                (SELECT MAX(payment_date) FROM payments WHERE loan_id = l.id) AS closure_date
            FROM loans l JOIN customers c ON l.customer_id = c.id JOIN vehicles v ON l.vehicle_id = v.id
            WHERE l.id = $1 AND l.status = 'Closed';
        `;
        const { rows } = await pool.query(query, [loan_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'NOC can only be generated for a closed loan.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching NOC data:', error);
        res.status(500).json({ message: 'An error occurred while fetching NOC data.' });
    }
});


// --- NEW FEATURE: EDIT CUSTOMER ---
app.put('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const {
            full_name, mobile_number, email, permanent_address, current_address,
            occupation, monthly_income, employer_details
        } = req.body;

        // We don't allow editing of Aadhaar or PAN for security/simplicity.
        const updateQuery = `
            UPDATE customers
            SET 
                full_name = $1, mobile_number = $2, email = $3, permanent_address = $4,
                current_address = $5, occupation = $6, monthly_income = $7, employer_details = $8,
                updated_at = NOW()
            WHERE id = $9
            RETURNING *;
        `;
        const values = [
            full_name, mobile_number, email, permanent_address, current_address,
            occupation, monthly_income, employer_details, id
        ];

        const { rows } = await pool.query(updateQuery, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        res.status(200).json({ message: 'Customer updated successfully!', customer: rows[0] });

    } catch (error) {
        console.error('Error updating customer:', error);
        if (error.code === '23505') { // Handle duplicate mobile/email
            return res.status(409).json({ message: `Another customer with this mobile or email already exists.` });
        }
        res.status(500).json({ message: 'An error occurred while updating the customer.' });
    }
});


// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
