// transactions.js
import { getTransactions, handleApiError } from '../../services/api';
import { formatDate } from '../../utils/util';

Page({
  data: {
    transactions: [],
    loading: true,
    refreshing: false,
    error: null
  },
  
  onLoad: function() {
    this.fetchTransactions();
  },
  
  onShow: function() {
    // Refresh data when returning to this page
    this.fetchTransactions();
  },
  
  onPullDownRefresh: function() {
    this.setData({ refreshing: true });
    this.fetchTransactions();
  },
  
  fetchTransactions: function() {
    if (!this.data.refreshing) {
      this.setData({ loading: true });
    }
    
    getTransactions()
      .then(data => {
        // Format dates and sort by date (newest first)
        const formattedData = data.map(item => ({
          ...item,
          date: item.date // Date is already in YYYY-MM-DD format from the API
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.setData({ 
          transactions: formattedData,
          loading: false,
          refreshing: false,
          error: null
        });
      })
      .catch(error => {
        console.error('Failed to fetch transactions:', error);
        this.setData({ 
          loading: false,
          refreshing: false,
          error: error.message || '加载失败'
        });
        handleApiError(error);
      });
  },
  
  navigateToTransactionForm: function() {
    wx.navigateTo({
      url: '/pages/transaction-form/transaction-form'
    });
  },
  
  showTransactionDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/transaction-form/transaction-form?id=${id}`
    });
  }
});
