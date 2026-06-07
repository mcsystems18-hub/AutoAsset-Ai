# Lead Capture Integration - Steadfast Property Care

## 1. Database Integration (team-db)
The website's contact form is connected to a Node.js/Express backend (`server.js`) that interacts with the `team-db` CLI.

### Data Flow:
1. **Frontend:** User submits the React form on the "Contact" page.
2. **API Request:** The frontend sends a POST request to `/api/leads` with the user's details (Name, Email, Property Type, Message).
3. **Backend Logic:**
    - **Step 1:** Inserts the prospect into the `clients` table.
    - **Step 2:** Retrieves the new `client_id`.
    - **Step 3:** Inserts a new record into the `jobs` table with:
        - `title`: "New Website Lead"
        - `description`: The user's message.
        - `status`: "pending"
        - `priority`: "medium"
        - `service_type`: "other" (to be updated by dispatch)

## 2. Email Notifications
To notify the team of new leads, we recommend using a service like **SendGrid**, **Postmark**, or **AWS SES**.

### Implementation Strategy:
- When the `/api/leads` route successfully writes to the database, trigger an asynchronous function to send an internal alert.
- **Recipient:** `dispatch@steadfastpropertycare.com`
- **Subject:** `NEW LEAD: [Property Type] - [Client Name]`
- **Body:** Include all form details and a direct link to the `jobs` table for follow-up.

## 3. Auto-Response Email
Building trust starts with immediate communication.

### Implementation Strategy:
- Send an automated "Thank You" email to the prospect immediately after submission.
- **Subject:** `We've received your request - Steadfast Property Care`
- **Body Content:**
    > "Hi [Name],
    >
    > Thank you for reaching out to Steadfast Property Care. We've received your request regarding maintenance for your [Property Type].
    >
    > Our dispatch team is reviewing your details and will contact you within 24 hours to provide a quote or schedule an inspection.
    >
    > For urgent emergencies, please call us directly at (555) 123-4567.
    >
    > Best regards,
    > The Steadfast Team"

## 4. Local Testing
The current `server.js` is set up to log submissions to the console and write to the local `team-db`. For testing, run:
```bash
node server.js
```
Then submit a form through the website UI at `http://localhost:5173`.
