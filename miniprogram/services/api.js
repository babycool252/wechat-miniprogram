// API Service Layer for WeChat Mini Program

// Get the app instance to access global data
const app = getApp();

// Base URL for API requests
const BASE_URL = app.globalData.apiBaseUrl || 'http://localhost:8000';

/**
 * Generic request function that wraps wx.request in a Promise
 * @param {string} url - The endpoint URL (without base URL)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request data (for POST, PUT)
 * @returns {Promise} - Promise that resolves with response data
 */
const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject({
            statusCode: res.statusCode,
            message: res.data.detail || '请求失败'
          });
        }
      },
      fail: (err) => {
        reject({
          statusCode: 0,
          message: '网络错误，请检查网络连接'
        });
      }
    });
  });
};

/**
 * Get all transactions with optional filters
 * @param {object} params - Query parameters
 * @returns {Promise} - Promise that resolves with transactions data
 */
export const getTransactions = (params = {}) => {
  // Convert params object to URL query string
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = `/transactions${queryString ? `?${queryString}` : ''}`;
  return request(url);
};

/**
 * Get a single transaction by ID
 * @param {number} id - Transaction ID
 * @returns {Promise} - Promise that resolves with transaction data
 */
export const getTransaction = (id) => {
  return request(`/transactions/${id}`);
};

/**
 * Create a new transaction
 * @param {object} data - Transaction data
 * @returns {Promise} - Promise that resolves with created transaction
 */
export const createTransaction = (data) => {
  return request('/transactions', 'POST', data);
};

/**
 * Update an existing transaction
 * @param {number} id - Transaction ID
 * @param {object} data - Updated transaction data
 * @returns {Promise} - Promise that resolves with updated transaction
 */
export const updateTransaction = (id, data) => {
  return request(`/transactions/${id}`, 'PUT', data);
};

/**
 * Delete a transaction
 * @param {number} id - Transaction ID
 * @returns {Promise} - Promise that resolves when transaction is deleted
 */
export const deleteTransaction = (id) => {
  return request(`/transactions/${id}`, 'DELETE');
};

/**
 * Get categories by type (income or expense)
 * @param {string} type - Category type ('income' or 'expense')
 * @returns {Promise} - Promise that resolves with categories data
 */
export const getCategories = (type) => {
  const url = `/categories${type ? `?type=${type}` : ''}`;
  return request(url);
};

/**
 * Get transaction summary
 * @param {object} params - Query parameters (period, start_date, end_date)
 * @returns {Promise} - Promise that resolves with summary data
 */
export const getTransactionSummary = (params = {}) => {
  // Convert params object to URL query string
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = `/summary${queryString ? `?${queryString}` : ''}`;
  return request(url);
};

/**
 * Get city data
 * @returns {Promise} - Promise that resolves with city data
 */
export const getCity = () => {
  return request('/city');
};

/**
 * Get all buildings
 * @returns {Promise} - Promise that resolves with buildings data
 */
export const getBuildings = () => {
  return request('/buildings');
};

/**
 * Get all building types
 * @returns {Promise} - Promise that resolves with building types data
 */
export const getBuildingTypes = () => {
  return request('/building-types');
};

/**
 * Merge buildings
 * @param {object} data - Merge data (building_ids)
 * @returns {Promise} - Promise that resolves with merged building data
 */
export const mergeBuildings = (data) => {
  return request('/buildings/merge', 'POST', data);
};

/**
 * Error handler for API requests
 * @param {object} error - Error object
 * @returns {void} - Shows toast with error message
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  wx.showToast({
    title: error.message || '请求失败',
    icon: 'none',
    duration: 2000
  });
};
