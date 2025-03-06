// summary.js
import { getTransactionSummary, handleApiError } from '../../services/api';
import { getDateRange } from '../../utils/util';

Page({
  data: {
    summary: {},
    selectedPeriod: 'month', // Default to monthly view
    breakdownType: 'expense', // Default to expense breakdown
    loading: true
  },
  
  onLoad: function() {
    this.fetchSummary();
  },
  
  onShow: function() {
    // Refresh data when returning to this page
    this.fetchSummary();
  },
  
  fetchSummary: function() {
    this.setData({ loading: true });
    
    // Get date range based on selected period
    const dateRange = getDateRange(this.data.selectedPeriod);
    
    getTransactionSummary({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    })
      .then(data => {
        // Calculate percentages for category breakdowns
        const processedData = this.processData(data);
        
        this.setData({ 
          summary: processedData,
          loading: false
        });
      })
      .catch(error => {
        console.error('Failed to fetch summary:', error);
        handleApiError(error);
        this.setData({ loading: false });
      });
  },
  
  processData: function(data) {
    // Calculate percentages for expense categories
    if (data.expense_by_category && data.expense_by_category.length > 0) {
      const totalExpense = data.total_expense || 0;
      data.expense_by_category = data.expense_by_category.map(item => ({
        ...item,
        percentage: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0
      }));
    } else {
      data.expense_by_category = [];
    }
    
    // Calculate percentages for income categories
    if (data.income_by_category && data.income_by_category.length > 0) {
      const totalIncome = data.total_income || 0;
      data.income_by_category = data.income_by_category.map(item => ({
        ...item,
        percentage: totalIncome > 0 ? Math.round((item.amount / totalIncome) * 100) : 0
      }));
    } else {
      data.income_by_category = [];
    }
    
    // Calculate balance
    data.balance = (data.total_income || 0) - (data.total_expense || 0);
    
    return data;
  },
  
  changePeriod: function(e) {
    const period = e.currentTarget.dataset.period;
    this.setData({ selectedPeriod: period });
    this.fetchSummary();
  },
  
  changeBreakdownType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ breakdownType: type });
  },
  
  navigateToTransactions: function() {
    wx.switchTab({
      url: '/pages/transactions/transactions'
    });
  }
});
