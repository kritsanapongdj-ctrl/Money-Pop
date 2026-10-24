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
 * 3. Database Storage Helpers (ScriptProperties + Fallback Google Sheet)
 * ----------------------------------------------------------------------------
 */
function loadDatabase() {
  const jsonStr = SCRIPT_PROP.getProperty(DB_PROP_KEY);
  if (jsonStr) {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {}
  }
  return {
    members: [],
    categories: [],
    sources: [],
    savings: { currentAmount: 0, transactions: [] },
    expenses: []
  };
}

function saveDatabase(db) {
  SCRIPT_PROP.setProperty(DB_PROP_KEY, JSON.stringify(db));
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
 * Identify family member based on forwarding headers or body
 */
function identifyMember(msg, body, members) {
  // Check if forwarded: Look for "Forwarded message From: member@gmail.com"
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    if (m.email && m.email.trim()) {
      const emailPattern = new RegExp(m.email.trim(), 'i');
      if (emailPattern.test(body)) {
        return m;
      }
    }
  }

  // If not forwarded from another member, it's sent directly to the script owner (Member #1 / You)
  // Usually the script owner is the current user or first admin member
  const ownerEmail = Session.getEffectiveUser().getEmail();
  const ownerMember = members.find(m => m.email && m.email.toLowerCase() === ownerEmail.toLowerCase()) || members[0];
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
 * Extract Amount & Due Date from email body or subject
 */
function extractStatementMetrics(subject, body, msg) {
  const now = new Date();
  const currentMonth = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM');
  let amount = 0;
  let dueDate = '';

  // Match currency pattern: เช่น "ยอดเรียกเก็บ 1,250.00 บาท" หรือ "ยอดรวม 1,250.00"
  const amountMatch = body.match(/(?:ยอดเรียกเก็บ|ยอดชำระรอบนี้|ยอดที่ต้องชำระ|ยอดรวม|Total Amount|Amount Due)[^\d]{0,25}([0-9,]+\.[0-9]{2})/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // Match date pattern: เช่น "ครบกำหนดชำระ 15/10/2026" หรือ "15 ต.ค. 2569"
  const dateMatch = body.match(/(?:ครบกำหนด|Payment Due Date|Due Date)[^\d]{0,25}(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (dateMatch) {
    dueDate = dateMatch[1];
  }

  return {
    amount: amount,
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
      statementDue: metrics.amount,
      dueDate: metrics.dueDate,
      updatedAt: Date.now()
    };
    db.sources.push(src);
  } else {
    src.statementDue = metrics.amount;
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
