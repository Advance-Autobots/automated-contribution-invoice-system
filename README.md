# Automated Contribution Management & Receipt Generation System

An automated contribution management and PDF receipt generation system built using **Google Forms, Google Sheets, and Google Apps Script**.

The project simplifies contributor data collection, payment verification, receipt generation, and email communication. It is suitable for NGOs, AOPs, educational institutions, and other organizations collecting contributions.

## 🚀 Features

- **Contributor Registration:** Collect contributor details through Google Forms.
- **Centralized Data Management:** Store contributor information in Google Sheets.
- **Payment Verification:** Admin can manually verify payments before approving receipts.
- **Automated Receipt Generation:** Generate PDF receipts after payment approval.
- **Email Notifications:** Automatically send PDF receipts to contributors.
- **Admin Notifications:** Notify administrators when a new contribution form is submitted.
- **Audit Copy:** Send a copy of the generated receipt to the administrator.
- **Receipt Tracking:** Maintain receipt and email delivery status in Google Sheets.

## 🛠️ Technologies Used

- Google Forms
- Google Sheets
- Google Apps Script
- JavaScript
- HTML
- Google Drive
- Gmail

## 📂 Project Structure

```text
automated-contribution-invoice-system/
│
├── README.md
│
├── create_google_form.js
│
├── google_apps_script.js
│
└── HOW_TO_USE - STEP BY STEP GUIDE.txt
```

## ⚙️ How It Works

The project follows an event-triggered automation process.

1. Contributor opens the Google Form.
2. Contributor enters personal details and contribution information.
3. Contributor submits the form with payment reference details or proof.
4. Information is automatically stored in Google Sheets.
5. Administrator receives an email notification.
6. Administrator verifies the payment manually.
7. Administrator changes the Approval Status to **Approved**.
8. Google Apps Script generates a PDF receipt.
9. The receipt is emailed to the contributor.
10. An audit copy is emailed to the administrator.
11. The spreadsheet is updated with the receipt delivery status.

## 📋 Contributor Information Collected

The Google Form collects the following information:

- Email Address
- Contributor Name
- Relationship Details (S/O, D/O, W/O)
- Address
- WhatsApp Mobile Number
- Contribution Amount
- Payment Mode
- Payment Screenshot / UTR Details

## 📊 Google Sheets Management

The linked Google Spreadsheet acts as the central database.

It maintains contributor information and tracks:

- Contributor details
- Contribution amount
- Payment information
- Approval Status
- Invoice Number
- Invoice Sent Status

The administrator can review submissions and approve payments through the spreadsheet.

## 🔧 Installation & Setup

### Step 1: Clone or Download the Repository

Download the project files from this GitHub repository.

### Step 2: Create the Google Form

1. Open Google Apps Script.
2. Create a new Apps Script project.
3. Copy the code from `create_google_form.js`.
4. Paste it into the Apps Script editor.
5. Run the script and authorize the required permissions.
6. Open the generated Google Form and linked spreadsheet.

### Step 3: Configure Google Apps Script

1. Open the Apps Script project associated with the spreadsheet.
2. Copy the code from `google_apps_script.js`.
3. Paste it into the script editor.
4. Save the project.
5. Run the setup function, if provided, and authorize the required permissions.
6. Configure the required triggers.

### Step 4: Configure Organization Details

Update the Settings sheet with the relevant information:

- Organization Name
- Organization Address
- PAN Details, where applicable
- Administrator Email
- Receipt Prefix
- Currency
- Applicable Tax Note

### Step 5: Test the Automation

1. Submit a test response through the Google Form.
2. Check whether the response appears in Google Sheets.
3. Verify that the administrator receives an email alert.
4. Manually verify the test payment details.
5. Change the Approval Status to Approved.
6. Check whether the PDF receipt is generated and emailed successfully.

**Note:** Refer to `HOW_TO_USE - STEP BY STEP GUIDE.txt` for detailed setup instructions.

## 🔐 Payment Verification

This version uses **manual payment verification**.

The administrator checks the submitted UTR/reference number or payment screenshot against the organization's bank statement or payment records.

Only after verification should the administrator change the Approval Status to Approved.

**Important:** This project does not currently include an integrated payment gateway or automatic bank transaction verification.

## 📧 Receipt Generation

After approval, the system:

- Generates a PDF receipt.
- Assigns a receipt/invoice number.
- Emails the PDF to the contributor.
- Sends an audit copy to the administrator.
- Updates the delivery status in Google Sheets.


## ⚠️ Important Notes

- Payment verification must be completed manually in the current version.
- A payment gateway is not integrated.
- WhatsApp receipt delivery is not implemented in the current version.
- Email delivery depends on Google Apps Script and Gmail permissions.
- Review the applicable tax and exemption provisions before issuing receipts. Do not assume that every contribution qualifies for Section 80G benefits.

## 🤝 Contributions

Suggestions, improvements, and contributions to this project are welcome.

Feel free to fork this repository and submit a pull request.

## 📄 License

This project is available for learning, educational, and customization purposes. Add an appropriate open-source license before permitting reuse or redistribution.

---

**Developed using Google Apps Script, Google Forms, and Google Sheets.**
