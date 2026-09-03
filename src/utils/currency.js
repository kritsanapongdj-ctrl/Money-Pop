export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB',
    maximumFractionDigits: 2
  }).format(parseFloat(amount) || 0);
};
