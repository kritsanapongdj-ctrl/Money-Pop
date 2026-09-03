/**
 * Extract or resolve the installment series identifier for an expense.
 * Handles legacy fields (installmentGroupId), current fields (groupId),
 * and ID format conventions (e.g. "1776934758271-5").
 */
export const getExpenseGroupId = (exp) => {
  if (!exp) return null;
  if (exp.groupId) return String(exp.groupId);
  if (exp.installmentGroupId) return String(exp.installmentGroupId);
  
  // If paymentType is installment and id has format "prefix-number"
  if ((exp.paymentType === 'installment' || exp.installmentMonths) && typeof exp.id === 'string') {
    const parts = exp.id.split('-');
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      return parts[0];
    }
  }
  return null;
};

/**
 * Checks whether an expense is an installment series item.
 */
export const isInstallmentExpense = (exp) => {
  if (!exp) return false;
  return exp.paymentType === 'installment' || Boolean(exp.installmentMonths) || Boolean(getExpenseGroupId(exp));
};

/**
 * Filter out an expense from the expense list.
 * If the expense is an installment, it deletes ALL installments in the series across all months,
 * preventing orphaned installments from reappearing in subsequent months.
 */
export const filterOutExpense = (expenses, targetExp) => {
  if (!Array.isArray(expenses) || !targetExp) return expenses || [];
  
  const targetGroupId = getExpenseGroupId(targetExp);
  const targetId = String(targetExp.id);
  
  return expenses.filter(item => {
    // If target belongs to an installment series
    if (targetGroupId) {
      const itemGroupId = getExpenseGroupId(item);
      if (itemGroupId && itemGroupId === targetGroupId) {
        return false;
      }
      const itemId = String(item.id);
      if (itemId === targetGroupId || itemId.startsWith(`${targetGroupId}-`)) {
        return false;
      }
    }
    
    // Direct ID match
    if (String(item.id) === targetId) {
      return false;
    }
    
    return true;
  });
};
