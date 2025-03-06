// API 服务层 - 微信小程序接口封装

/**
 * 微信小程序 API 服务层
 * 封装了与后端 API 的所有交互
 * 提供统一的请求处理、错误处理和数据转换
 */

// 获取应用实例以访问全局数据
const app = getApp();

// API 请求的基础 URL
// 开发环境使用 localhost，生产环境应替换为实际服务器地址
const BASE_URL = app.globalData.apiBaseUrl || 'http://localhost:8000';

/**
 * 通用请求函数 - 将微信的 wx.request 封装为 Promise
 * 
 * 该函数处理所有 API 请求的基本逻辑，包括：
 * - 构建完整的 URL
 * - 发送请求并处理响应
 * - 统一的成功/错误处理
 * - 将回调式 API 转换为 Promise 风格
 * 
 * @param {string} url - 接口端点 URL（不包含基础 URL）
 * @param {string} method - HTTP 方法（GET, POST, PUT, DELETE）
 * @param {object} data - 请求数据（用于 POST, PUT 请求）
 * @returns {Promise} - 返回一个 Promise，成功时解析为响应数据
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
        // 处理成功响应（状态码 2xx）
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          // 处理服务器返回的错误
          reject({
            statusCode: res.statusCode,
            message: res.data.detail || '请求失败'
          });
        }
      },
      fail: (err) => {
        // 处理网络错误或请求失败
        reject({
          statusCode: 0,
          message: '网络错误，请检查网络连接'
        });
      }
    });
  });
};

/**
 * 获取所有交易记录（支持筛选）
 * 
 * 该函数获取用户的交易记录列表，支持通过多种参数进行筛选
 * 
 * @param {object} params - 查询参数对象，可包含以下字段：
 *   - type: 交易类型（income/expense）
 *   - category_id: 分类ID
 *   - start_date: 开始日期（YYYY-MM-DD）
 *   - end_date: 结束日期（YYYY-MM-DD）
 *   - location: 位置
 * @returns {Promise} - 返回Promise，解析为交易记录数组
 */
export const getTransactions = (params = {}) => {
  // 将参数对象转换为URL查询字符串
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = `/transactions${queryString ? `?${queryString}` : ''}`;
  return request(url);
};

/**
 * 获取单个交易记录详情
 * 
 * 根据ID获取特定交易的详细信息
 * 
 * @param {number} id - 交易记录ID
 * @returns {Promise} - 返回Promise，解析为交易记录对象
 */
export const getTransaction = (id) => {
  return request(`/transactions/${id}`);
};

/**
 * 创建新的交易记录
 * 
 * 创建一笔新的收入或支出记录，同时会在城市中添加对应的建筑
 * 
 * @param {object} data - 交易数据，包含以下字段：
 *   - type: 交易类型（income/expense）
 *   - amount: 金额
 *   - category_id: 分类ID
 *   - description: 描述（可选）
 *   - date: 日期（YYYY-MM-DD）
 *   - location: 位置（可选）
 * @returns {Promise} - 返回Promise，解析为创建的交易记录
 */
export const createTransaction = (data) => {
  return request('/transactions', 'POST', data);
};

/**
 * 更新现有交易记录
 * 
 * 修改已存在的交易记录信息
 * 
 * @param {number} id - 交易记录ID
 * @param {object} data - 更新的交易数据
 * @returns {Promise} - 返回Promise，解析为更新后的交易记录
 */
export const updateTransaction = (id, data) => {
  return request(`/transactions/${id}`, 'PUT', data);
};

/**
 * 删除交易记录
 * 
 * 删除指定的交易记录，同时会移除对应的城市建筑
 * 
 * @param {number} id - 交易记录ID
 * @returns {Promise} - 返回Promise，解析为删除操作结果
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
 * 获取城市数据
 * 
 * 获取用户城市的基本信息，如网格大小、建筑数量等
 * 
 * @returns {Promise} - 返回Promise，解析为城市数据对象
 */
export const getCity = () => {
  return request('/city');
};

/**
 * 获取所有建筑
 * 
 * 获取用户城市中的所有建筑信息，包括位置、类型、等级等
 * 
 * @returns {Promise} - 返回Promise，解析为建筑数据数组
 */
export const getBuildings = () => {
  return request('/buildings');
};

/**
 * 获取所有建筑类型
 * 
 * 获取系统中定义的所有建筑类型信息
 * 
 * @returns {Promise} - 返回Promise，解析为建筑类型数据数组
 */
export const getBuildingTypes = () => {
  return request('/building-types');
};

/**
 * 合并建筑
 * 
 * 将多个相同类型和等级的建筑合并为一个更高等级的建筑
 * 这是游戏的核心玩法之一，通过记账来获得建筑，通过合并建筑来升级
 * 
 * @param {object} data - 合并数据，包含以下字段：
 *   - building_ids: 要合并的建筑ID数组
 * @returns {Promise} - 返回Promise，解析为合并后的新建筑数据
 */
export const mergeBuildings = (data) => {
  return request('/buildings/merge', 'POST', data);
};

/**
 * API请求错误处理函数
 * 
 * 统一处理API请求中的错误，向用户显示友好的错误提示
 * 同时在控制台记录详细错误信息，便于调试
 * 
 * @param {object} error - 错误对象，包含以下可能的字段：
 *   - statusCode: HTTP状态码
 *   - message: 错误消息
 * @returns {void} - 显示包含错误信息的提示框
 */
export const handleApiError = (error) => {
  console.error('API请求错误:', error);
  wx.showToast({
    title: error.message || '请求失败',
    icon: 'none',
    duration: 2000
  });
};
