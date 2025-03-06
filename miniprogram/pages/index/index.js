// index.js
Page({
  data: {},
  
  onLoad: function() {},
  
  navigateToTransactions: function() {
    wx.switchTab({
      url: '/pages/transactions/transactions'
    });
  },
  
  navigateToCityView: function() {
    wx.switchTab({
      url: '/pages/city-view/city-view'
    });
  },
  
  navigateToSummary: function() {
    wx.switchTab({
      url: '/pages/summary/summary'
    });
  },
  
  navigateToTransactionForm: function() {
    wx.navigateTo({
      url: '/pages/transaction-form/transaction-form'
    });
  }
});
