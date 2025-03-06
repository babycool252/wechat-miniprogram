/**
 * 格式化日期为 YYYY-MM-DD 格式
 * 
 * 将 Date 对象转换为标准日期字符串格式，用于显示和API交互
 * 
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的日期字符串，如 "2025-03-06"
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
  const day = String(date.getDate()).padStart(2, '0'); // 日期补零
  return `${year}-${month}-${day}`;
};

/**
 * 将数字格式化为货币格式
 * 
 * 将数字转换为带货币符号的字符串，保留两位小数
 * 
 * @param {number} amount - 要格式化的金额
 * @param {string} currency - 货币符号（默认：'¥'人民币）
 * @returns {string} - 格式化后的货币字符串，如 "¥100.00"
 */
export const formatCurrency = (amount, currency = '¥') => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * 获取当前日期（YYYY-MM-DD格式）
 * 
 * 返回当前系统日期的标准格式字符串，常用于设置表单默认日期
 * 
 * @returns {string} - 当前日期字符串，如 "2025-03-06"
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * 深度克隆对象
 * 
 * 创建对象的完整副本，包括嵌套对象和数组
 * 注意：此方法不支持函数、循环引用等特殊情况
 * 
 * @param {object} obj - 要克隆的对象
 * @returns {object} - 克隆后的对象副本
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 检查值是否为空
 * 
 * 全面检查各种类型的空值情况，包括：
 * - null 或 undefined
 * - 空字符串
 * - 空数组
 * - 空对象
 * 
 * @param {any} value - 要检查的值
 * @returns {boolean} - 如果为空返回 true，否则返回 false
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
 * 生成随机颜色
 * 
 * 创建一个随机的十六进制颜色代码，可用于测试或动态样式
 * 
 * @returns {string} - 随机十六进制颜色代码，如 "#1a2b3c"
 */
export const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * 获取指定时间段的日期范围
 * 
 * 根据指定的时间段（天、周、月、年）计算开始日期和结束日期
 * 主要用于统计分析功能中的时间范围选择
 * 
 * @param {string} period - 时间段类型：
 *   - 'day': 当天
 *   - 'week': 最近7天
 *   - 'month': 当月
 *   - 'year': 当年
 *   - 其他值: 默认为最近30天
 * @returns {object} - 包含开始日期和结束日期的对象：
 *   - start_date: 开始日期（YYYY-MM-DD格式）
 *   - end_date: 结束日期（YYYY-MM-DD格式）
 */
export const getDateRange = (period) => {
  const today = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'day':
      // 当天
      break;
    case 'week':
      // 最近7天（包括今天）
      startDate.setDate(today.getDate() - 6);
      break;
    case 'month':
      // 当月（从1号到今天）
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'year':
      // 当年（从1月1日到今天）
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      // 默认为最近30天
      startDate.setDate(today.getDate() - 29);
  }
  
  return {
    start_date: formatDate(startDate),
    end_date: formatDate(today)
  };
};
