/**
 * ============================================================================
 * 1-CLICK UNIVERSAL GOOGLE FORM & GOOGLE SHEET CREATOR
 * ============================================================================
 * 
 * DESCRIPTION:
 * Creates a fully functional Google Form and connected Google Sheet with
 * an editable '⚙️ Settings' tab in under 10 seconds.
 * 
 * NO HARDCODED PERSONAL DATA:
 * This script is completely white-label. Any organization can run this to deploy
 * their own intake form and response spreadsheet.
 * 
 * HOW TO RUN:
 * 1. Open your browser logged into your Google Account.
 * 2. Go to: https://script.new (opens a blank Google Apps Script editor).
 * 3. Delete any default code, paste this entire file, and click Save (Ctrl + S).
 * 4. Ensure function 'createContributionForm' is selected in the top toolbar.
 * 5. Click the 'Run' button and grant Google Drive / Forms permissions.
 * 6. The Execution Log at the bottom will display your Form URL & Sheet URL!
 * ============================================================================
 */

/* ============================================================================
   EDITABLE CONFIGURATION (CUSTOMIZE OR LEAVE AS PLACEHOLDERS)
   ============================================================================ */
const TEMPLATE_CONFIG = {
  // Title shown on the Google Form
  formTitle: "Contribution & Payment Details Form",
  
  // Introductory description explaining instructions to contributors
  formDescription: 
    "Thank you for your generous support and contribution!\n\n" +
    "Please fill out this form after making your payment so that our accounts team can " +
    "verify the transaction and issue your official tax-exempt receipt/invoice.",
    
  // Organization / Trust details pre-populated in the '⚙️ Settings' sheet tab
  organizationName: "[YOUR_ORGANIZATION_OR_TRUST_NAME]",
  tagline: "[YOUR_ORGANIZATION_TAGLINE_OR_MISSION]",
  registrationOrPan: "REG: [YOUR_REG_NO] | PAN: [YOUR_PAN_NO]",
  address: "[YOUR_REGISTERED_OFFICE_ADDRESS]",
  contactPhone: "+91 [YOUR_CONTACT_PHONE_NUMBER]",
  invoicePrefix: "REC-2026-",
  currencyCode: "INR",
  currencySymbol: "₹ ",
  taxExemptionNote: "Donations are exempt under Section 80G of the Income Tax Act."
};


/* ============================================================================
   MAIN AUTOMATION FUNCTION
   ============================================================================ */
function createContributionForm() {
  // 1. Create the Google Form
  const form = FormApp.create(TEMPLATE_CONFIG.formTitle);
  form.setTitle(TEMPLATE_CONFIG.formTitle);
  form.setDescription(TEMPLATE_CONFIG.formDescription);

  // Question 1: Contributor Email
  form.addTextItem()
    .setTitle("Email Address")
    .setHelpText("Your official receipt will be emailed to this address.")
    .setRequired(true);

  // Question 2: Contributor Name
  form.addTextItem()
    .setTitle("Name")
    .setHelpText("Full name as it should appear on the official invoice.")
    .setRequired(true);

  // Question 3: Relationship (S/O, D/O, W/O)
  form.addTextItem()
    .setTitle("S/O , D/O , W/O")
    .setHelpText("Parent or Spouse name (e.g., S/O Rajesh Kumar or W/O Anand Sharma).")
    .setRequired(true);

  // Question 4: Postal Address
  form.addParagraphTextItem()
    .setTitle("Address")
    .setHelpText("Residential or office address for receipt records.")
    .setRequired(true);

  // Question 5: WhatsApp Phone Number
  form.addTextItem()
    .setTitle("Phone number ( Whatapp Number)")
    .setHelpText("10-digit mobile number with WhatsApp.")
    .setRequired(true);

  // Question 6: Contribution Amount
  form.addTextItem()
    .setTitle("Contribution Amount")
    .setHelpText("Amount in currency (e.g., 5000).")
    .setRequired(true);

  // Question 7: Contribution Mode
  const modeItem = form.addMultipleChoiceItem();
  modeItem.setTitle("Contribution Mode")
    .setChoiceValues([
      "UPI (Google Pay, PhonePe, Paytm)",
      "Net Banking (IMPS / NEFT)",
      "Credit / Debit Card",
      "Cheque",
      "Cash"
    ])
    .setRequired(true);

  // Question 8: Payment Screenshot / Reference ID
  form.addTextItem()
    .setTitle("Payment Screenshot ( If UPI)")
    .setHelpText("Google Drive link to screenshot, OR UPI Reference / UTR Number (e.g. 431209874561).")
    .setRequired(true);

  // 2. Create the connected Google Sheet
  const spreadsheet = SpreadsheetApp.create("Contribution Form Responses & Invoices");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  // Wait 1.5 seconds for Google Drive linking to finalize
  Utilities.sleep(1500);

  // 3. Create and Populate the '⚙️ Settings' Sheet Tab
  const settingsSheet = spreadsheet.insertSheet("⚙️ Settings");
  
  // Detect currently signed-in user's email if possible
  let detectedEmail = "";
  try {
    detectedEmail = Session.getActiveUser().getEmail();
  } catch (e) {
    detectedEmail = "";
  }
  const defaultAdminEmail = detectedEmail || "[YOUR_ADMIN_EMAIL@DOMAIN.COM]";

  const settingsData = [
    ["Configuration Parameter", "Your Custom Value", "Description / Notes"],
    ["Organization / Trust Name", TEMPLATE_CONFIG.organizationName, "Full legal name of the entity collecting contributions"],
    ["Tagline / Mission", TEMPLATE_CONFIG.tagline, "Mission statement or tagline printed on the invoice header"],
    ["Reg. Number / PAN", TEMPLATE_CONFIG.registrationOrPan, "Official Registration, Trust Reg, 12A, 80G, or PAN Number"],
    ["Address", TEMPLATE_CONFIG.address, "Official postal address printed on the invoice"],
    ["Contact Phone", TEMPLATE_CONFIG.contactPhone, "Official contact / WhatsApp number"],
    ["Admin Email (Receives Alerts)", defaultAdminEmail, "Email that receives payment proof alerts and audit copies of all invoices"],
    ["Invoice Prefix", TEMPLATE_CONFIG.invoicePrefix, "Prefix for receipt IDs (e.g., REC-2026-, INV-, DON-)"],
    ["Currency Code", TEMPLATE_CONFIG.currencyCode, "Standard 3-letter currency code (e.g. INR, USD, EUR, GBP)"],
    ["Currency Symbol", TEMPLATE_CONFIG.currencySymbol, "Currency symbol displayed on invoices (e.g. ₹ , $ , €)"],
    ["Tax Exemption Note", TEMPLATE_CONFIG.taxExemptionNote, "Tax deduction note or statutory disclaimer on receipts"]
  ];

  settingsSheet.getRange(1, 1, settingsData.length, 3).setValues(settingsData);
  settingsSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#1A365D").setFontColor("#FFFFFF");
  settingsSheet.getRange("A2:A11").setFontWeight("bold").setBackground("#F7FAFC");
  settingsSheet.setColumnWidth(1, 240);
  settingsSheet.setColumnWidth(2, 380);
  settingsSheet.setColumnWidth(3, 360);

  // 4. Output Generated URLs to Execution Log
  const publishedUrl = form.getPublishedUrl();
  const editUrl = form.getEditUrl();
  const sheetUrl = spreadsheet.getUrl();

  Logger.log("=================================================");
  Logger.log("🎉 SUCCESS! UNIVERSAL FORM & SHEET CREATED");
  Logger.log("=================================================");
  Logger.log("1. Public Form URL (Share with contributors):");
  Logger.log(publishedUrl);
  Logger.log("\n2. Form Edit URL (To edit questions):");
  Logger.log(editUrl);
  Logger.log("\n3. Linked Google Sheet URL (Where responses arrive):");
  Logger.log(sheetUrl);
  Logger.log("=================================================");
}
