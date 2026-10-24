/**
 * ============================================================================
 * Money-Pop Vault - Google Apps Script Backend (v5.2 Multi-Member e-Statement)
 * ============================================================================
 * Project ID: 1SLbXvbq4avVLRNt71lMNePINA35BZE-43CGfeRl-oyDJW7p9quOPXly6
 * Features:
 *  1. Database Sync (doGet / doPost) for Web App (React)
 *  2. MacroDroid Webhook Handler (action=syncCredit)
 *  3. Multi-Member Email e-Statement Scanner (scanEmailStatements)
 *     - Direct emails to script owner (You)
 *     - Auto-forwarded emails from other family members (No shared email needed!)
 *  4. Duplicate Prevention via Gmail Label (MoneyPop-Processed)
 */

const SCRIPT_PROP = PropertiesService.getScriptProperties();
const DB_PROP_KEY = 'moneyPopDB';
const PROCESSED_LABEL = 'MoneyPop-Processed';

/**
 * ----------------------------------------------------------------------------
 * 1. HTTP GET: Data retrieval & Manual Trigger endpoints
 * ----------------------------------------------------------------------------
 */
function doGet(e) {
  e = e || { parameter: {} };
  const action = e.parameter.action;

  // Trigger: Manual Email Scan
  if (action === 'scanEmail') {
    const report = scanEmailStatements();
    return createJsonResponse({ success: true, report: report });
  }

  // Trigger: MacroDroid Push Notification Webhook
  if (action === 'syncCredit') {
    return handleMacroDroidWebhook(e.parameter);
  }

  // Trigger: Debug & Auto-Restore Inspector
  if (action === 'debugRestore') {
    return createJsonResponse(debugRestoreData());
  }

  // Default: Return Full Database JSON
  const db = loadDatabase();
  return createJsonResponse(db);
}

/**
 * ----------------------------------------------------------------------------
 * 2. HTTP POST: Data updates from Web App or Webhooks
 * ----------------------------------------------------------------------------
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);

    // If payload is a MacroDroid sync request
    if (payload.action === 'syncCredit') {
      return handleMacroDroidWebhook(payload);
    }

    // Default: Full Database Save from React Web App
    saveDatabase(payload);
    return createJsonResponse({ success: true, timestamp: Date.now() });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * ----------------------------------------------------------------------------
 * 3. Database Storage Helpers (Self-Healing: ScriptProperties + Google Sheet)
 * ----------------------------------------------------------------------------
 */
function loadDatabase() {
  let db = {
    members: [],
    categories: [],
    sources: [],
    savings: { currentAmount: 0, transactions: [] },
    expenses: []
  };

  // 1. Try reading from ScriptProperties
  const jsonStr = SCRIPT_PROP.getProperty(DB_PROP_KEY);
  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        db = Object.assign(db, parsed);
      }
    } catch (e) {}
  }

  // 2. If spreadsheet is bound, check sheets for missing expenses or data
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      // Check RawData sheet
      const rawData = loadFromRawDataSheet(ss);
      if (rawData) {
        if (!db.members || db.members.length === 0) db.members = rawData.members || [];
        if (!db.categories || db.categories.length === 0) db.categories = rawData.categories || [];
        if (!db.sources || db.sources.length === 0) db.sources = rawData.sources || [];
        if (!db.savings || !db.savings.currentAmount) db.savings = rawData.savings || db.savings;
        if ((!db.expenses || db.expenses.length === 0) && rawData.expenses && rawData.expenses.length > 0) {
          db.expenses = rawData.expenses;
        }
      }

      // Check Expenses sheet (232 rows) if db.expenses is still empty
      if (!db.expenses || db.expenses.length === 0) {
        const sheetExpenses = loadExpensesFromSheet(ss);
        if (sheetExpenses && sheetExpenses.length > 0) {
          Logger.log('Successfully recovered ' + sheetExpenses.length + ' expenses from Expenses sheet!');
          db.expenses = sheetExpenses;
        }
      }
    }
  } catch (err) {
    Logger.log('Spreadsheet load notice: ' + err);
  }

  // Cache back to ScriptProperties so subsequent reads are instant
  if ((db.members && db.members.length > 0) || (db.expenses && db.expenses.length > 0)) {
    SCRIPT_PROP.setProperty(DB_PROP_KEY, JSON.stringify(db));
  }

  return db;
}

function saveDatabase(db) {
  // 1. Save to ScriptProperties
  SCRIPT_PROP.setProperty(DB_PROP_KEY, JSON.stringify(db));

  // 2. Also save to RawData sheet (NEVER overwrite Expenses tabular sheet!)
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      let rawSheet = ss.getSheetByName('RawData');
      if (!rawSheet) {
        rawSheet = ss.insertSheet('RawData');
      }
      if (rawSheet) {
        rawSheet.getRange(1, 1).setValue(JSON.stringify(db));
      }
    }
  } catch (err) {}
}

/**
 * Load expenses from tabular "Expenses" sheet
 */
function loadExpensesFromSheet(ss) {
  const sheet = ss.getSheetByName('Expenses') || ss.getSheetByName('expenses');
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];

  const rawValues = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  let headerRowIndex = 0;
  let headers = rawValues[0].map(h => String(h).trim());

  // If cell A1 starts with '{' or is blank, check row 2 or use standard schema
  if (headers[0] && (headers[0].startsWith('{') || headers[0] === '')) {
    if (rawValues.length > 2 && typeof rawValues[1][0] === 'string' && !rawValues[1][0].startsWith('{') && isNaN(Number(rawValues[1][0]))) {
      headers = rawValues[1].map(h => String(h).trim());
      headerRowIndex = 1;
    } else {
      headers = ['id', 'title', 'month', 'categoryId', 'sourceId', 'paymentType', 'totalAmount', 'payerType', 'payerId', 'splitDetails', 'status'];
      headerRowIndex = 0;
    }
  }

  const expenses = [];
  for (let r = headerRowIndex + 1; r < rawValues.length; r++) {
    const row = rawValues[r];
    if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) continue;

    const exp = {};
    for (let c = 0; c < headers.length && c < row.length; c++) {
      const key = headers[c];
      if (!key) continue;
      let val = row[c];

      if (typeof val === 'string') {
        val = val.trim();
        if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
          try { val = JSON.parse(val); } catch (e) {}
        }
      }

      exp[key] = val;
    }

    if (!exp.id && exp.title) {
      exp.id = String(Date.now() + r);
    }
    if (exp.totalAmount !== undefined && exp.totalAmount !== '') {
      exp.totalAmount = parseFloat(exp.totalAmount) || 0;
    }
    if (exp.month && exp.month instanceof Date) {
      exp.month = Utilities.formatDate(exp.month, 'GMT+7', 'yyyy-MM');
    }
    if (exp.installmentMonths) {
      exp.installmentMonths = parseInt(exp.installmentMonths) || 1;
    }
    if (exp.currentInstallment) {
      exp.currentInstallment = parseInt(exp.currentInstallment) || 1;
    }
    if (exp.fullTotalAmount) {
      exp.fullTotalAmount = parseFloat(exp.fullTotalAmount) || exp.totalAmount;
    }

    if (exp.title || exp.totalAmount > 0) {
      expenses.push(exp);
    }
  }

  return expenses;
}

/**
 * Load raw JSON database from RawData sheet (if split across columns)
 */
function loadFromRawDataSheet(ss) {
  const sheet = ss.getSheetByName('RawData') || ss.getSheetByName('rawdata');
  if (!sheet) return null;
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return null;

  const vals = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  let combined = {};

  for (let c = 0; c < vals.length; c++) {
    const val = vals[c];
    if (typeof val === 'string' && val.trim().startsWith('{')) {
      try {
        const obj = JSON.parse(val);
        combined = Object.assign(combined, obj);
      } catch (e) {}
    }
  }

  return Object.keys(combined).length > 0 ? combined : null;
}

/**
 * Diagnostic & Restore helper function that the user can run directly from GAS editor!
 * Shows exactly what was found in Spreadsheet or Properties.
 */
function debugRestoreData() {
  // Clear empty cached expenses from ScriptProperties so it forcefully pulls from sheet
  const curStr = SCRIPT_PROP.getProperty(DB_PROP_KEY);
  if (curStr) {
    try {
      const cur = JSON.parse(curStr);
      if (!cur.expenses || cur.expenses.length === 0) {
        SCRIPT_PROP.deleteProperty(DB_PROP_KEY);
      }
    } catch (e) {}
  }

  const loaded = loadDatabase();
  const report = {
    scriptPropertiesKeys: Object.keys(SCRIPT_PROP.getProperties()),
    spreadsheetFound: false,
    restoredCounts: {
      members: loaded.members ? loaded.members.length : 0,
      categories: loaded.categories ? loaded.categories.length : 0,
      sources: loaded.sources ? loaded.sources.length : 0,
      expenses: loaded.expenses ? loaded.expenses.length : 0,
      savingsAmount: loaded.savings ? loaded.savings.currentAmount : 0
    },
    sampleExpense: loaded.expenses && loaded.expenses.length > 0 ? loaded.expenses[0] : null
  };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      report.spreadsheetFound = true;
      report.spreadsheetName = ss.getName();
      report.spreadsheetId = ss.getId();
      report.sheets = ss.getSheets().map(function(s) {
        return {
          name: s.getName(),
          lastRow: s.getLastRow(),
          lastCol: s.getLastColumn()
        };
      });
    }
  } catch (e) {
    report.spreadsheetError = e.toString();
  }

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

/**
 * ----------------------------------------------------------------------------
 * 4. Multi-Member Email e-Statement Scanner
 * ----------------------------------------------------------------------------
 * How it resolves family members without a shared bot email:
 *  - Script owner (You): Emails sent directly to your Gmail.
 *  - Other family members: Set an Auto-Forward rule in their personal Gmail:
 *    "If from: bank (e.g. @ktc.co.th, @linebk.com, @uob.co.th) -> Forward to YOUR Gmail"
 *  - This function inspects headers/body to identify which member forwarded it,
 *    unlocks the statement data, and assigns it to their Personal Credit Vault!
 */
function scanEmailStatements() {
  const db = loadDatabase();
  const label = getOrCreateLabel(PROCESSED_LABEL);

  // Search for bank statement emails not yet processed
  const query = 'has:attachment filename:pdf (from:ktc.co.th OR from:linebk OR from:uob.co.th OR from:kasikornbank.com OR from:ttbbank.com OR from:cardx.co.th OR from:scb.co.th OR subject:"ใบแจ้งยอด" OR subject:"e-Statement" OR subject:"Statement") -label:' + PROCESSED_LABEL;
  const threads = GmailApp.search(query, 0, 15);
  const results = [];

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();
    const lastMsg = messages[messages.length - 1];

    const subject = lastMsg.getSubject();
    const from = lastMsg.getFrom();
    const body = lastMsg.getPlainBody();

    // 1. Identify which family member this statement belongs to
    const targetMember = identifyMember(lastMsg, body, db.members);
    if (!targetMember) {
      Logger.log('Could not identify member for thread: ' + subject);
      continue;
    }

    // 2. Identify the bank / credit source (LINE BK, KTC, UOB, etc.)
    const bankInfo = identifyBank(from, subject, body);

    // 3. Extract statement metrics (Due Date, Total Amount Due, Min Due)
    const metrics = extractStatementMetrics(subject, body, lastMsg);

    if (metrics.amount > 0) {
      // 4. Update Personal Credit Vault in Database
      updateMemberCreditSource(db, targetMember.id, bankInfo.name, bankInfo.type, metrics);

      // 5. Create or Update Pending Bill in Expenses for that month
      createExpenseBill(db, targetMember.id, bankInfo.name, metrics);

      results.push({
        member: targetMember.name,
        bank: bankInfo.name,
        amount: metrics.amount,
        dueDate: metrics.dueDate,
        month: metrics.month
      });

      // Mark as processed
      thread.addLabel(label);
    }
  }

  if (results.length > 0) {
    saveDatabase(db);
  }

  return results;
}

/**
 * Identify family member based on forwarding headers or body (supports multiple comma-separated emails per member)
 */
function identifyMember(msg, body, members) {
  // Check if forwarded from any of the member's registered emails
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    if (m.email && m.email.trim()) {
      const emailList = m.email.split(/[,;\s]+/).filter(Boolean);
      for (let j = 0; j < emailList.length; j++) {
        const emailAddr = emailList[j].trim();
        if (emailAddr) {
          const emailPattern = new RegExp(emailAddr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          if (emailPattern.test(body)) {
            return m;
          }
        }
      }
    }
  }

  // If not forwarded from another member, it's sent directly to the script owner (Member #1 / You)
  const ownerEmail = Session.getEffectiveUser().getEmail().toLowerCase();
  const ownerMember = members.find(m => {
    if (!m.email) return false;
    const list = m.email.toLowerCase().split(/[,;\s]+/).filter(Boolean);
    return list.includes(ownerEmail);
  }) || members[0];

  return ownerMember;
}

/**
 * Identify bank from sender or subject
 */
function identifyBank(from, subject, body) {
  const combined = (from + ' ' + subject + ' ' + body).toLowerCase();
  if (combined.includes('line bk') || combined.includes('linebk')) {
    return { name: 'LineBK', type: 'credit_line' };
  }
  if (combined.includes('ktc')) {
    return { name: 'บัตรเครดิต KTC', type: 'credit_card' };
  }
  if (combined.includes('uob') || combined.includes('tmrw')) {
    return { name: 'บัตรเครดิต UOB', type: 'credit_card' };
  }
  if (combined.includes('ttb') || combined.includes('tmb')) {
    return { name: 'บัตรเครดิต TTB', type: 'credit_card' };
  }
  if (combined.includes('cardx') || combined.includes('scb')) {
    return { name: 'บัตรเครดิต CardX/SCB', type: 'credit_card' };
  }
  if (combined.includes('shopee') || combined.includes('spaylater')) {
    return { name: 'SPayLater', type: 'credit_line' };
  }
  return { name: 'บัตรเครดิต/สินเชื่อ', type: 'credit_card' };
}

/**
 * Extract Amount, Total Limit, Available Limit & Due Date from email body or subject
 */
function extractStatementMetrics(subject, body, msg) {
  const now = new Date();
  const currentMonth = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM');
  let amount = 0;
  let dueDate = '';
  let totalLimit = 0;
  let availableLimit = 0;

  // Match statement due: เช่น "ยอดเรียกเก็บ 1,250.00 บาท" หรือ "ยอดรวม 1,250.00"
  const amountMatch = body.match(/(?:ยอดเรียกเก็บ|ยอดชำระรอบนี้|ยอดที่ต้องชำระ|ยอดรวมรอบบิล|Total Amount Due|Amount Due)[^\d]{0,25}([0-9,]+\.[0-9]{2})/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // Match total credit limit: เช่น "วงเงินบัตร 50,000.00" หรือ "วงเงินรวม"
  const totalLimitMatch = body.match(/(?:วงเงินบัตร|วงเงินรวม|วงเงินที่ได้รับอนุมัติ|Credit Limit|Total Limit)[^\d]{0,25}([0-9,]+\.[0-9]{2})/i);
  if (totalLimitMatch) {
    totalLimit = parseFloat(totalLimitMatch[1].replace(/,/g, ''));
  }

  // Match available credit limit: เช่น "วงเงินคงเหลือ 35,000.00"
  const availLimitMatch = body.match(/(?:วงเงินคงเหลือ|วงเงินคงเหลือที่ใช้ได้|Available Credit|Available Limit)[^\d]{0,25}([0-9,]+\.[0-9]{2})/i);
  if (availLimitMatch) {
    availableLimit = parseFloat(availLimitMatch[1].replace(/,/g, ''));
  }

  // Match date pattern: เช่น "ครบกำหนดชำระ 15/10/2026" หรือ "15 ต.ค. 2569"
  const dateMatch = body.match(/(?:ครบกำหนด|Payment Due Date|Due Date)[^\d]{0,25}(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (dateMatch) {
    dueDate = dateMatch[1];
  }

  return {
    amount: amount,
    totalLimit: totalLimit,
    availableLimit: availableLimit,
    dueDate: dueDate,
    month: currentMonth
  };
}

/**
 * Update or Insert credit source in Personal Credit Vault
 */
function updateMemberCreditSource(db, memberId, sourceName, sourceType, metrics) {
  let src = db.sources.find(s => String(s.ownerId) === String(memberId) && s.name.toLowerCase().includes(sourceName.toLowerCase()));
  if (!src) {
    src = {
      id: Date.now().toString() + '_' + Math.floor(Math.random() * 1000),
      name: sourceName,
      type: sourceType,
      ownerId: String(memberId),
      totalLimit: metrics.totalLimit || 0,
      availableLimit: metrics.availableLimit || 0,
      statementDue: metrics.amount,
      dueDate: metrics.dueDate,
      updatedAt: Date.now()
    };
    db.sources.push(src);
  } else {
    src.statementDue = metrics.amount;
    if (metrics.totalLimit > 0) src.totalLimit = metrics.totalLimit;
    if (metrics.availableLimit > 0) src.availableLimit = metrics.availableLimit;
    if (metrics.dueDate) src.dueDate = metrics.dueDate;
    src.updatedAt = Date.now();
  }
}

/**
 * Create a pending expense bill for the month if not existing
 */
function createExpenseBill(db, memberId, sourceName, metrics) {
  const existing = db.expenses.find(e => 
    e.month === metrics.month && 
    String(e.payerId) === String(memberId) && 
    e.title.includes(sourceName)
  );

  if (!existing) {
    const defaultCat = db.categories[0] ? db.categories[0].id : '';
    const src = db.sources.find(s => String(s.ownerId) === String(memberId) && s.name.includes(sourceName));

    db.expenses.push({
      id: Date.now().toString() + '_bill',
      title: 'บิล ' + sourceName + ' (' + metrics.month + ')',
      month: metrics.month,
      categoryId: defaultCat,
      sourceId: src ? src.id : '',
      paymentType: 'normal',
      totalAmount: metrics.amount,
      payerType: 'single',
      payerId: String(memberId),
      status: 'pending',
      createdAt: Date.now(),
      createdBy: String(memberId)
    });
  }
}

/**
 * ----------------------------------------------------------------------------
 * 5. MacroDroid Webhook Handler (Android Push Notifications)
 * ----------------------------------------------------------------------------
 */
function handleMacroDroidWebhook(params) {
  const db = loadDatabase();
  const memberId = params.memberId || params.payerId;
  const sourceName = params.source || params.bank || 'แจ้งเตือนอัตโนมัติ';
  const amount = parseFloat(params.amount) || 0;

  if (memberId && amount > 0) {
    updateMemberCreditSource(db, memberId, sourceName, 'credit_line', {
      amount: amount,
      dueDate: '',
      month: Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM')
    });
    saveDatabase(db);
    return createJsonResponse({ success: true, updated: sourceName, amount: amount });
  }

  return createJsonResponse({ success: false, message: 'Invalid payload' });
}

/**
 * ----------------------------------------------------------------------------
 * 6. Utilities & Automated Trigger Setup
 * ----------------------------------------------------------------------------
 */
function getOrCreateLabel(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) {
    label = GmailApp.createLabel(name);
  }
  return label;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this function ONCE from GAS editor to automatically scan emails every 6 hours
 */
function setupAutoScanTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'scanEmailStatements') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Set every 6 hours
  ScriptApp.newTrigger('scanEmailStatements')
    .timeBased()
    .everyHours(6)
    .create();

  Logger.log('Scheduled email scan trigger created successfully!');
}
