/**
 * ============================================================================
 * UNIVERSAL WHITE-LABEL AUTOMATED CONTRIBUTION & INVOICE SYSTEM
 * ============================================================================
 * 
 * DESCRIPTION:
 * A 100% editable, plug-and-play script for any Trust, NGO, School, Foundation,
 * or Organization to automate payment verification, PDF invoice generation,
 * and email dispatch directly from Google Sheets.
 * 
 * NO HARDCODED PERSONAL DATA:
 * This script is completely white-label. You can configure your details either:
 *   METHOD A (Easiest): Edit the '⚙️ Settings' sheet tab inside your Google Sheet.
 *   METHOD B: Customize the DEFAULT_CONFIG section below.
 * 
 * HOW TO INSTALL:
 * 1. Open your Google Sheet (linked to your Google Form).
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code, paste this entire file, and click Save (Ctrl + S).
 * 4. In the function dropdown, select 'setupAllTriggers' and click 'Run'.
 * 5. Grant permissions when prompted.
 * ============================================================================
 */

/* ============================================================================
   1. EDITABLE DEFAULT CONFIGURATION (FALLBACK DEFAULTS)
   ============================================================================ */
const DEFAULT_CONFIG = {
  // Name of the Trust, NGO, Foundation, or Company collecting contributions
  organizationName: "[YOUR_ORGANIZATION_OR_TRUST_NAME]",
  
  // Mission statement, subtitle, or tagline printed on receipts
  tagline: "[YOUR_ORGANIZATION_TAGLINE_OR_MISSION]",
  
  // Legal Registration, 12A, 80G, or PAN/Tax Identification Number
  registrationOrPan: "REG: [YOUR_REG_NO] | PAN: [YOUR_PAN_NO]",
  
  // Official registered postal address
  address: "[YOUR_REGISTERED_OFFICE_ADDRESS]",
  
  // Contact phone or WhatsApp number
  contactPhone: "+91 [YOUR_CONTACT_PHONE_NUMBER]",
  
  // Admin email that receives new submission alerts and invoice archive copies
  // Automatically detects the logged-in user's email if left as empty or placeholder
  adminEmail: "[YOUR_ADMIN_EMAIL@DOMAIN.COM]",
  
  // Receipt / Invoice Number prefix (e.g. REC-2026-, INV-2026-, DON-)
  invoicePrefix: "REC-2026-",
  
  // Currency code and symbol
  currencyCode: "INR",
  currencySymbol: "₹ ",
  
  // Tax benefit or statutory disclaimer note printed at the bottom of the invoice
  taxExemptionNote: "Donations are exempt under Section 80G of the Income Tax Act."
};


/* ============================================================================
   2. ONE-TIME INITIALIZATION & TRIGGER SETUP
   ============================================================================ */
/**
 * Run this function ONCE from the Apps Script editor to initialize the system.
 * Creates the '⚙️ Settings' tab, adds dropdowns, and installs automated triggers.
 */
function setupAllTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ensure the editable '⚙️ Settings' sheet tab exists
  ensureSettingsTab(ss);
  
  // 2. Ensure tracking headers and dropdown validations exist in the responses sheet
  ensureTrackingHeaders();
  applyDropdownToAllRows();

  // 3. Reset existing triggers to avoid duplicate email dispatch
  const triggers = ScriptApp.getUserTriggers(ss);
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Trigger 1: When Creator/Admin selects 'Approved' in the sheet
  ScriptApp.newTrigger('onApprovalEditTrigger')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  // Trigger 2: When a new contributor submits the Google Form
  ScriptApp.newTrigger('onFormSubmitTrigger')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  
  SpreadsheetApp.getUi().alert(
    "SUCCESS! Automated triggers are now active.\n\n" +
    "You can customize your Organization Name, Admin Email, Address, and Invoice Prefix anytime " +
    "directly in the '⚙️ Settings' tab of this Google Sheet!"
  );
}


/* ============================================================================
   3. SETTINGS TAB CREATOR & DYNAMIC CONFIGURATION LOADER
   ============================================================================ */
/**
 * Creates and formats the '⚙️ Settings' tab in the Google Sheet.
 */
function ensureSettingsTab(ss) {
  let settingsSheet = ss.getSheetByName("⚙️ Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("⚙️ Settings");
  }

  // Populate only if empty
  if (settingsSheet.getLastRow() < 2) {
    // Automatically detect current user's email if available
    let activeEmail = "";
    try {
      activeEmail = Session.getActiveUser().getEmail();
    } catch (e) {
      activeEmail = "";
    }
    const initialEmail = activeEmail || DEFAULT_CONFIG.adminEmail;

    const settingsData = [
      ["Configuration Parameter", "Your Custom Value", "Description / Notes"],
      ["Organization / Trust Name", DEFAULT_CONFIG.organizationName, "Full legal name of the entity collecting contributions"],
      ["Tagline / Mission", DEFAULT_CONFIG.tagline, "Mission statement or tagline printed on the invoice header"],
      ["Reg. Number / PAN", DEFAULT_CONFIG.registrationOrPan, "Official Registration, Trust Reg, 12A, 80G, or PAN Number"],
      ["Address", DEFAULT_CONFIG.address, "Official postal address printed on the invoice"],
      ["Contact Phone", DEFAULT_CONFIG.contactPhone, "Official contact / WhatsApp number"],
      ["Admin Email (Receives Alerts)", initialEmail, "Email that receives payment proof alerts and audit copies of all invoices"],
      ["Invoice Prefix", DEFAULT_CONFIG.invoicePrefix, "Prefix for receipt IDs (e.g., REC-2026-, INV-, DON-)"],
      ["Currency Code", DEFAULT_CONFIG.currencyCode, "Standard 3-letter currency code (e.g. INR, USD, EUR, GBP)"],
      ["Currency Symbol", DEFAULT_CONFIG.currencySymbol, "Currency symbol displayed on invoices (e.g. ₹ , $ , €)"],
      ["Tax Exemption Note", DEFAULT_CONFIG.taxExemptionNote, "Tax deduction note or statutory disclaimer on receipts"]
    ];

    settingsSheet.getRange(1, 1, settingsData.length, 3).setValues(settingsData);
    settingsSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#1A365D").setFontColor("#FFFFFF");
    settingsSheet.getRange("A2:A11").setFontWeight("bold").setBackground("#F7FAFC");
    settingsSheet.setColumnWidth(1, 240);
    settingsSheet.setColumnWidth(2, 380);
    settingsSheet.setColumnWidth(3, 360);
  }
}

/**
 * Dynamically reads the latest settings from the '⚙️ Settings' tab.
 * Falls back to DEFAULT_CONFIG if any setting is blank.
 */
function getDynamicConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("⚙️ Settings");
  
  const config = {
    name: DEFAULT_CONFIG.organizationName,
    tagline: DEFAULT_CONFIG.tagline,
    reg: DEFAULT_CONFIG.registrationOrPan,
    address: DEFAULT_CONFIG.address,
    phone: DEFAULT_CONFIG.contactPhone,
    adminEmail: DEFAULT_CONFIG.adminEmail,
    invoicePrefix: DEFAULT_CONFIG.invoicePrefix,
    currencyCode: DEFAULT_CONFIG.currencyCode,
    currencySymbol: DEFAULT_CONFIG.currencySymbol,
    taxNote: DEFAULT_CONFIG.taxExemptionNote
  };

  // Attempt to autofill current user email if placeholder
  try {
    const currentEmail = Session.getActiveUser().getEmail();
    if (currentEmail && (config.adminEmail.includes("[") || !config.adminEmail)) {
      config.adminEmail = currentEmail;
    }
  } catch (e) {}

  if (!settingsSheet) return config;

  const data = settingsSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0].toString().trim().toLowerCase();
    const val = data[i][1] ? data[i][1].toString().trim() : "";
    if (!val) continue;

    if (key.includes("organization") || key.includes("trust")) config.name = val;
    else if (key.includes("tagline") || key.includes("mission")) config.tagline = val;
    else if (key.includes("reg") || key.includes("pan")) config.reg = val;
    else if (key.includes("address")) config.address = val;
    else if (key.includes("phone")) config.phone = val;
    else if (key.includes("admin email")) config.adminEmail = val;
    else if (key.includes("invoice prefix")) config.invoicePrefix = val;
    else if (key.includes("currency code")) config.currencyCode = val;
    else if (key.includes("currency symbol")) config.currencySymbol = val;
    else if (key.includes("tax")) config.taxNote = val;
  }
  return config;
}


/* ============================================================================
   4. COLUMN & DROPDOWN MANAGEMENT
   ============================================================================ */
/**
 * Ensures the 4 system tracking columns exist in the form response sheet.
 */
function ensureTrackingHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Form Responses 1") || ss.getSheets()[0];
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, Math.max(lastCol, 1)).getValues()[0];
  
  const requiredCols = ["Invoice Number", "Approval Status", "Invoice Sent Status", "Sent Timestamp"];
  requiredCols.forEach(col => {
    if (headers.indexOf(col) === -1) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(col).setFontWeight("bold").setBackground("#EDF2F7");
    }
  });
}

/**
 * Applies the interactive Dropdown validation to the entire 'Approval Status' column.
 */
function applyDropdownToAllRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Form Responses 1") || ss.getSheets()[0];
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const approvalCol = headers.findIndex(h => h.toString().toLowerCase().includes("approval status")) + 1;
  if (approvalCol > 0) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Pending", "Approved", "Rejected"], true)
      .build();
    sheet.getRange(2, approvalCol, 999, 1).setDataValidation(rule);
  }
}


/* ============================================================================
   5. AUTOMATED ON-EDIT EVENT HANDLER (CREATOR APPROVAL GATE)
   ============================================================================ */
/**
 * Triggered automatically whenever a cell is edited in the spreadsheet.
 * When 'Approval Status' is changed to 'Approved', it initiates invoice dispatch.
 */
function onApprovalEditTrigger(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    
    // Ignore edits made inside the '⚙️ Settings' sheet
    if (sheet.getName() === "⚙️ Settings") return;

    const row = range.getRow();
    const col = range.getColumn();
    const val = range.getValue().toString().trim();

    // Ignore edits on header row
    if (row <= 1) return;

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headerName = headers[col - 1].toString().trim().toLowerCase();

    // Check if the edited column is 'Approval Status' and user selected 'Approved'
    if (headerName.includes("approval status") && val.toLowerCase() === "approved") {
      processAndSendInvoice(sheet, row);
    }
  } catch (err) {
    Logger.log("Error in onApprovalEditTrigger: " + err);
  }
}


/* ============================================================================
   6. PDF INVOICE GENERATOR & EMAIL DISPATCHER
   ============================================================================ */
/**
 * Reads row data, builds custom PDF invoice, and sends emails to Contributor & Admin.
 */
function processAndSendInvoice(sheet, row) {
  const cfg = getDynamicConfig();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowVals = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

  function getColVal(key) {
    const idx = headers.findIndex(h => h.toString().toLowerCase().includes(key.toLowerCase()));
    return idx !== -1 ? rowVals[idx] : "";
  }
  function setColVal(key, value) {
    const idx = headers.findIndex(h => h.toString().toLowerCase().includes(key.toLowerCase()));
    if (idx !== -1) sheet.getRange(row, idx + 1).setValue(value);
  }

  // Idempotency: Avoid sending duplicate invoices for already-sent rows
  if (getColVal("Invoice Sent Status").toString().trim() === "Sent") {
    SpreadsheetApp.getActiveSpreadsheet().toast("Invoice was already sent for this record.", "Notice", 4);
    return;
  }

  const name = getColVal("Name") || "Valued Contributor";
  const email = getColVal("Email").toString().trim();
  const relation = getColVal("S/O") || getColVal("Relationship") || "N/A";
  const address = getColVal("Address") || "N/A";
  const phone = getColVal("Phone") || "N/A";
  const amount = getColVal("Amount") || "0";
  const mode = getColVal("Mode") || "UPI";

  if (!email || email.indexOf("@") === -1) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Missing or invalid email for this contributor.", "Error", 5);
    return;
  }

  // Assign formatted sequential invoice number if not present
  let invoiceNo = getColVal("Invoice Number").toString().trim();
  if (!invoiceNo) {
    invoiceNo = cfg.invoicePrefix + ("0000" + (row - 1)).slice(-4);
    setColVal("Invoice Number", invoiceNo);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(`Generating Invoice ${invoiceNo} for ${name}...`, "Processing", 5);

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MMM-yyyy");
  const htmlInvoice = buildCustomInvoiceHtml(cfg, invoiceNo, today, name, relation, address, phone, email, amount, mode);

  // Compile PDF Blob
  const cleanFilename = `Invoice_${invoiceNo}_${name.replace(/[^a-zA-Z0-9]/g, "")}.pdf`;
  const pdfBlob = Utilities.newBlob(htmlInvoice, "text/html", cleanFilename).getAs("application/pdf");

  // 1. Send Email to Contributor
  GmailApp.sendEmail(email, `Official Contribution Receipt: ${invoiceNo} — ${cfg.name}`, "", {
    htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #2d3748; line-height: 1.6; max-width: 600px;">
        <h2 style="color: #1a365d;">Thank you for your generous contribution, ${name}!</h2>
        <p>We gratefully acknowledge receipt of your contribution of <strong>${cfg.currencyCode} ${amount}</strong> via <strong>${mode}</strong>.</p>
        <p>Your payment has been verified and approved by our accounts verification cell. Your official PDF receipt (<strong>${invoiceNo}</strong>) is attached to this email.</p>
        <p style="font-size: 13px; color: #718096;"><em>${cfg.taxNote}</em></p>
        <br/>
        <p>Warm regards,<br/><strong>Accounts Team</strong><br/>${cfg.name}<br/>${cfg.phone}</p>
      </div>
    `,
    attachments: [pdfBlob],
    name: cfg.name
  });

  // 2. Send Audit Copy to Admin
  if (cfg.adminEmail && !cfg.adminEmail.includes("[")) {
    GmailApp.sendEmail(cfg.adminEmail, `[ADMIN AUDIT COPY] Invoice ${invoiceNo} Dispatched to ${name}`, "", {
      htmlBody: `
        <p>Confirmation that Invoice <strong>${invoiceNo}</strong> (${cfg.currencyCode} ${amount}) was successfully generated and dispatched to ${name} (${email}).</p>
        <p>A copy of the PDF receipt is attached for your accounting records.</p>
      `,
      attachments: [pdfBlob],
      name: cfg.name
    });
  }

  // 3. Update Status and Timestamp in the Google Sheet
  const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
  setColVal("Invoice Sent Status", "Sent");
  setColVal("Sent Timestamp", nowStr);

  SpreadsheetApp.getActiveSpreadsheet().toast(`✅ Invoice ${invoiceNo} sent to ${email}!`, "Success", 8);
}


/* ============================================================================
   7. HTML INVOICE TEMPLATE (CONVERTED TO PDF)
   ============================================================================ */
function buildCustomInvoiceHtml(cfg, invoiceNo, dateStr, name, relation, address, phone, email, amount, mode) {
  return `
  <!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2d3748; padding: 30px; margin: 0; }
    .header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 15px; }
    .org-title { font-size: 20px; font-weight: bold; color: #1a365d; margin: 0; }
    .banner { background: #1a365d; color: white; text-align: center; font-size: 13px; font-weight: bold; padding: 7px; border-radius: 4px; margin: 15px 0; letter-spacing: 0.5px; }
    .grid { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .grid td { width: 50%; padding: 10px; background: #f7fafc; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: top; }
    .table-items { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
    .table-items th { background: #edf2f7; color: #1a365d; padding: 8px; border: 1px solid #cbd5e0; text-align: left; }
    .table-items td { padding: 8px; border: 1px solid #cbd5e0; }
    .badge { background: #c6f6d5; color: #22543d; font-weight: bold; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #718096; }
  </style></head><body>
    <div class="header">
      <h1 class="org-title">${cfg.name}</h1>
      <p style="font-size: 11px; color: #718096; margin: 3px 0;">${cfg.tagline}</p>
      <p style="font-size: 11px; color: #718096; margin: 3px 0;">Registration: <b>${cfg.reg}</b> | Address: ${cfg.address}</p>
      <p style="font-size: 11px; color: #718096; margin: 3px 0;">Phone: ${cfg.phone} | Email: ${cfg.adminEmail}</p>
    </div>
    <div class="banner">OFFICIAL CONTRIBUTION RECEIPT / INVOICE</div>
    <table class="grid"><tr>
      <td>
        <strong>RECEIVED WITH THANKS FROM:</strong><br/>
        Name: <b>${name}</b><br/>S/O, D/O, W/O: ${relation}<br/>Address: ${address}<br/>Phone (WhatsApp): ${phone}<br/>Email: ${email}
      </td>
      <td>
        <strong>RECEIPT & TRANSACTION DETAILS:</strong><br/>
        Receipt No: <b style="color: #1a365d;">${invoiceNo}</b><br/>Date: ${dateStr}<br/>Payment Mode: ${mode}<br/>
        Status: <span class="badge">PAYMENT VERIFIED & APPROVED</span>
      </td>
    </tr></table>
    <table class="table-items">
      <thead><tr><th>#</th><th>Description of Contribution / Purpose</th><th>Mode</th><th style="text-align: right;">Amount (${cfg.currencyCode})</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>Voluntary Contribution towards Educational & Welfare Initiatives</td><td>${mode}</td><td style="text-align: right; font-weight: bold;">${cfg.currencySymbol}${amount}</td></tr>
        <tr style="background:#f7fafc; font-weight: bold;"><td colspan="3" style="text-align: right;">TOTAL RECEIVED:</td><td style="text-align: right; color:#1a365d; font-size: 13px;">${cfg.currencySymbol}${amount}</td></tr>
      </tbody>
    </table>
    <div style="background: #fefcbf; border: 1px solid #d69e2e; padding: 8px; font-size: 11px; border-radius: 4px; margin-top: 10px;">
      <b>Tax Exemption Note:</b> ${cfg.taxNote} (Computer-generated authenticated receipt).
    </div>
    <table style="width: 100%; margin-top: 35px;"><tr>
      <td style="font-size: 10px; color: #718096;">Accounts & Verification Cell<br/>Authenticated Digital Record</td>
      <td style="text-align: right;"><p style="margin: 0; font-weight: bold; font-size: 11px; color: #1a365d;">For ${cfg.name}</p><br/><br/><p style="margin: 0; font-size: 10px; border-top: 1px solid #a0aec0; display: inline-block; padding-top: 3px;">Authorized Signatory</p></td>
    </tr></table>
  </body></html>`;
}


/* ============================================================================
   8. FORM SUBMISSION EVENT HANDLER (ALERT ADMIN)
   ============================================================================ */
/**
 * Triggered automatically whenever a contributor submits the Google Form.
 * Initializes the row to 'Pending' and sends an instant alert email to the Admin.
 */
function onFormSubmitTrigger(e) {
  try {
    const cfg = getDynamicConfig();
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    function getVal(key) {
      const idx = headers.findIndex(h => h.toString().toLowerCase().includes(key.toLowerCase()));
      return idx !== -1 ? rowValues[idx] : "";
    }
    function setVal(key, val) {
      const idx = headers.findIndex(h => h.toString().toLowerCase().includes(key.toLowerCase()));
      if (idx !== -1) sheet.getRange(row, idx + 1).setValue(val);
    }

    setVal("Approval Status", "Pending");
    setVal("Invoice Sent Status", "Pending");

    const name = getVal("Name") || "A Contributor";
    const amount = getVal("Amount") || "0";
    const mode = getVal("Mode") || "UPI";
    const screenshot = getVal("Screenshot") || "None";
    const phone = getVal("Phone") || "N/A";
    const email = getVal("Email") || "N/A";

    if (cfg.adminEmail && !cfg.adminEmail.includes("[")) {
      MailApp.sendEmail({
        to: cfg.adminEmail,
        subject: `🔔 [ACTION REQUIRED] New Contribution: ${name} (${cfg.currencyCode} ${amount})`,
        htmlBody: `
          <h3>New Contribution Received for ${cfg.name}</h3>
          <p>A new contributor has submitted payment details and requires verification:</p>
          <ul>
            <li><strong>Contributor:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>WhatsApp:</strong> ${phone}</li>
            <li><strong>Amount:</strong> ${cfg.currencyCode} ${amount}</li>
            <li><strong>Payment Mode:</strong> ${mode}</li>
            <li><strong>Payment Screenshot:</strong> <a href="${screenshot}">${screenshot}</a></li>
          </ul>
          <p>Open your Google Sheet and change <strong>Approval Status</strong> to <strong>Approved</strong> to dispatch their invoice!</p>
        `
      });
    }
  } catch (err) {
    Logger.log("Trigger error: " + err);
  }
}
