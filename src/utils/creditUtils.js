/**
 * Utility functions for Personal Credit Vault calculations.
 * Adheres to Ponytail principles: simple pure functions, no bloat.
 */

/**
 * Calculates personal vs family credit utilization for a specific credit source.
 * Prevents double-counting by strictly segregating:
 * 1. Total statement due from provider
 * 2. Amount borrowed by other family members for pending expenses
 * 3. True personal debt share
 *
 * @param {Object} source - The credit source object
 * @param {Array} expenses - All expense records
 * @param {string} memberId - ID of the credit owner
 * @param {Array} members - All member objects for name resolution
 * @returns {Object} Calculated metrics
 */
export function calculateCreditUsage(source, expenses = [], memberId, members = []) {
  if (!source || !memberId) {
    return {
      borrowedByFamily: 0,
      personalDue: 0,
      familyBorrowers: [],
      utilizationRate: 0
    };
  }

  const sid = String(source.id);
  const mid = String(memberId);
  const totalLimit = parseFloat(source.totalLimit) || 0;
  const availableLimit = parseFloat(source.availableLimit) || 0;
  const statementDue = parseFloat(
    source.currentMonthDue !== undefined && source.currentMonthDue !== ''
      ? source.currentMonthDue
      : (source.statementDue || source.amount || 0)
  ) || 0;

  let borrowedTotal = 0;
  const familyBorrowers = [];

  expenses.forEach((exp) => {
    if (String(exp.sourceId) !== sid) return;

    if (exp.payerType === 'single') {
      // Someone else in family is assigned to pay this bill using our credit
      const isPaid = exp.status === 'paid';
      if (String(exp.payerId) !== mid && !isPaid) {
        const amt = parseFloat(exp.totalAmount) || 0;
        borrowedTotal += amt;
        const borrower = members.find((m) => String(m.id) === String(exp.payerId));
        familyBorrowers.push({
          expenseId: exp.id,
          borrowerId: exp.payerId,
          borrowerName: borrower ? borrower.name : 'คนในบ้าน',
          title: exp.title,
          amount: amt,
          month: exp.month
        });
      }
    } else if (exp.payerType === 'split' && exp.splitDetails) {
      // Split bill: sum shares belonging to other members that are still unpaid
      Object.entries(exp.splitDetails).forEach(([splitId, d]) => {
        if (String(splitId) !== mid && !d.paid) {
          const amt = parseFloat(d.amount) || 0;
          borrowedTotal += amt;
          const borrower = members.find((m) => String(m.id) === String(splitId));
          familyBorrowers.push({
            expenseId: exp.id,
            borrowerId: splitId,
            borrowerName: borrower ? borrower.name : 'คนในบ้าน',
            title: `${exp.title} (ส่วนของ ${borrower ? borrower.name : splitId})`,
            amount: amt,
            month: exp.month
          });
        }
      });
    }
  });

  // True personal share = Total due on statement minus what family owes us
  const personalDue = Math.max(0, statementDue - borrowedTotal);

  // Utilization rate (% of total limit used)
  const usedAmount = Math.max(0, totalLimit - availableLimit);
  const utilizationRate = totalLimit > 0 ? Math.min(100, Math.round((usedAmount / totalLimit) * 100)) : 0;

  return {
    statementDue,
    borrowedByFamily: borrowedTotal,
    personalDue,
    familyBorrowers,
    utilizationRate,
    usedAmount
  };
}
