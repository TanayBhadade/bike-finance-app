// --- Automated Reminder Service ---
// This script runs independently to check for due dates and send SMS reminders.
// It should be scheduled to run automatically once per day in a production environment.

require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');
const MSG91 = require('msg91-api');

// --- Configuration ---
const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'bike_finance_db',
    password: 'tanay', // <-- MAKE SURE THIS IS YOUR ACTUAL PASSWORD
    port: 2121,
};

// Get MSG91 credentials from the .env file
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

// Check if all required credentials are provided
if (!MSG91_AUTH_KEY || !MSG91_SENDER_ID || !MSG91_TEMPLATE_ID) {
    console.error('Error: Missing MSG91 credentials in the .env file.');
    process.exit(1); // Exit the script if credentials are missing
}

const pool = new Pool(dbConfig);
const msg91 = new MSG91(MSG91_AUTH_KEY, MSG91_SENDER_ID, '4'); // 4 is the route for transactional SMS

// --- Main Function ---
const sendReminders = async () => {
    console.log('Starting reminder service...');
    const client = await pool.connect();
    try {
        // Query to find active loans with a due date 3 days from now or 1 day from now
        const query = `
            SELECT 
                c.full_name,
                c.mobile_number,
                l.emi_amount,
                l.next_due_date
            FROM loans l
            JOIN customers c ON l.customer_id = c.id
            WHERE 
                l.status = 'Active' AND
                (l.next_due_date = CURRENT_DATE + INTERVAL '3 days' OR l.next_due_date = CURRENT_DATE + INTERVAL '1 day');
        `;

        const { rows } = await client.query(query);

        if (rows.length === 0) {
            console.log('No reminders to send today.');
            return;
        }

        console.log(`Found ${rows.length} customers to remind.`);

        for (const loan of rows) {
            const mobileNumber = `91${loan.mobile_number}`; // Add country code for MSG91
            const emi = parseFloat(loan.emi_amount).toFixed(2);
            const dueDate = new Date(loan.next_due_date).toLocaleDateString('en-IN');

            // This is a dynamic message. Ensure your DLT template supports variables.
            // Example DLT Template: "Dear {#var#}, your EMI of INR {#var#} for your loan is due on {#var#}. - YourBrand"
            const message = `Dear ${loan.full_name}, your EMI of INR ${emi} is due on ${dueDate}. Please pay on time.`;

            // In a real DLT setup, you would pass variables to the template
            const params = {
                // Example for a template like the one above
                // "VAR1": loan.full_name,
                // "VAR2": emi,
                // "VAR3": dueDate
            };

            console.log(`Sending SMS to ${mobileNumber}: ${message}`);

            // Uncomment the block below to send actual SMS
            /*
            msg91.send(mobileNumber, message, (err, response) => {
                if (err) {
                    console.error(`Failed to send SMS to ${mobileNumber}:`, err);
                } else {
                    console.log(`Successfully sent SMS to ${mobileNumber}. Response:`, response);
                }
            });
            */
        }

    } catch (error) {
        console.error('An error occurred while running the reminder service:', error);
    } finally {
        await client.release();
        await pool.end();
        console.log('Reminder service finished.');
    }
};

// Run the main function
sendReminders();
