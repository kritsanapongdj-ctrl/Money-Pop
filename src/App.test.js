import { filterOutExpense, getExpenseGroupId, isInstallmentExpense } from './utils/expenseUtils';
import { formatCurrency } from './utils/currency';

describe('Money-Pop Utilities & Business Logic Tests', () => {
  describe('formatCurrency', () => {
    test('formats positive amounts correctly in Thai Baht', () => {
      const formatted = formatCurrency(1250);
      expect(formatted).toContain('1,250');
      expect(formatted).toContain('฿');
    });

    test('handles zero and decimals correctly', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain('0');
    });
  });

  describe('isInstallmentExpense & getExpenseGroupId', () => {
    test('identifies installment items with groupId', () => {
      const item = { id: '1787837237727-1', groupId: '1787837237727', paymentType: 'installment' };
      expect(isInstallmentExpense(item)).toBe(true);
      expect(getExpenseGroupId(item)).toBe('1787837237727');
    });

    test('identifies legacy installment items with installmentGroupId', () => {
      const item = { id: '1776934758271-5', installmentGroupId: '1776934758271', installmentMonths: 12 };
      expect(isInstallmentExpense(item)).toBe(true);
      expect(getExpenseGroupId(item)).toBe('1776934758271');
    });

    test('identifies installment items with ID prefix', () => {
      const item = { id: '1776934758271-10', paymentType: 'installment' };
      expect(isInstallmentExpense(item)).toBe(true);
      expect(getExpenseGroupId(item)).toBe('1776934758271');
    });

    test('returns null for normal single expenses', () => {
      const item = { id: 'single-123', paymentType: 'normal' };
      expect(isInstallmentExpense(item)).toBe(false);
      expect(getExpenseGroupId(item)).toBeNull();
    });
  });

  describe('filterOutExpense (Permanent Deletion)', () => {
    test('deletes a normal single expense', () => {
      const expenses = [
        { id: '1', title: 'Coffee' },
        { id: '2', title: 'Lunch' },
        { id: '3', title: 'Dinner' }
      ];

      const result = filterOutExpense(expenses, { id: '2' });
      expect(result.length).toBe(2);
      expect(result.find(e => e.id === '2')).toBeUndefined();
    });

    test('deletes ALL installments across all months when deleting an installment item with groupId', () => {
      const expenses = [
        { id: 'unrelated-1', title: 'Netflix' },
        { id: 'chair-1', groupId: 'chair-group', month: '2026-08', paymentType: 'installment' },
        { id: 'chair-2', groupId: 'chair-group', month: '2026-09', paymentType: 'installment' },
        { id: 'chair-3', groupId: 'chair-group', month: '2026-10', paymentType: 'installment' }
      ];

      // User deletes installment 1 in month 2026-08
      const target = expenses[1]; // chair-1
      const result = filterOutExpense(expenses, target);

      // Must delete all 3 chair installments!
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('unrelated-1');
      expect(result.find(e => e.groupId === 'chair-group')).toBeUndefined();
    });

    test('deletes ALL legacy installments with installmentGroupId across months', () => {
      const expenses = [
        { id: 'house-1', installmentGroupId: 'house-999', month: '2026-04', paymentType: 'installment' },
        { id: 'house-2', installmentGroupId: 'house-999', month: '2026-05', paymentType: 'installment' },
        { id: 'house-3', installmentGroupId: 'house-999', month: '2026-06', paymentType: 'installment' },
        { id: 'grocery', id_num: 1, title: 'Supermarket' }
      ];

      const result = filterOutExpense(expenses, { id: 'house-1', installmentGroupId: 'house-999' });
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Supermarket');
    });

    test('deletes installments matching ID prefix convention', () => {
      const expenses = [
        { id: 'phone-1', paymentType: 'installment', month: '2026-07' },
        { id: 'phone-2', paymentType: 'installment', month: '2026-08' },
        { id: 'other-1', paymentType: 'normal' }
      ];

      const result = filterOutExpense(expenses, { id: 'phone-1', paymentType: 'installment' });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('other-1');
    });
  });
});