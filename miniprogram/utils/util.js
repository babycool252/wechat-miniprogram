/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '¥')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '¥') => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Get current date as YYYY-MM-DD
 * @returns {string} - Current date string
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty, false otherwise
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
};

/**
 * Generate a random color
 * @returns {string} - Random hex color
 */
export const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Get date range for a period
 * @param {string} period - Period ('day', 'week', 'month', 'year')
 * @returns {object} - Object with start_date and end_date
 */
export const getDateRange = (period) => {
  const today = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'day':
      // Today
      break;
    case 'week':
      // Last 7 days
      startDate.setDate(today.getDate() - 6);
      break;
    case 'month':
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'year':
      // Current year
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      // Default to last 30 days
      startDate.setDate(today.getDate() - 29);
  }
  
  return {
    start_date: formatDate(startDate),
    end_date: formatDate(today)
  };
};
