// transaction-form.js
import { 
  getTransaction, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getCategories, 
  handleApiError 
} from '../../services/api';
import { formatDate, getCurrentDate } from '../../utils/util';

Page({
  data: {
    isEditing: false,
    transactionId: null,
    formData: {
      type: 'expense',
      amount: '',
      category_id: 0,
      description: '',
      location: '',
      date: ''
    },
    categories: [],
    selectedCategory: null,
    loading: false
  },
  
  onLoad: function(options) {
    // Set today's date as default
    const today = getCurrentDate();
    this.setData({
      'formData.date': today
    });
    
    // Check if editing an existing transaction
    if (options.id) {
      this.setData({ 
        isEditing: true,
        transactionId: options.id,
        loading: true
      });
      
      // Fetch transaction data
      getTransaction(options.id)
        .then(data => {
          this.setData({
            formData: {
              type: data.type,
              amount: data.amount.toString(),
              category_id: data.category_id,
              description: data.description || '',
              location: data.location || '',
              date: data.date
            },
            loading: false
          });
          
          // Fetch categories based on transaction type
          this.fetchCategories(data.type);
        })
        .catch(error => {
          console.error('Failed to fetch transaction:', error);
          handleApiError(error);
          this.setData({ loading: false });
        });
    } else {
      // New transaction, just fetch categories
      this.fetchCategories(this.data.formData.type);
    }
  },
  
  fetchCategories: function(type) {
    this.setData({ loading: true });
    
    getCategories(type)
      .then(data => {
        this.setData({ 
          categories: data,
          loading: false
        });
        
        // If editing, set the selected category
        if (this.data.isEditing && this.data.formData.category_id) {
          const selectedCategory = data.find(c => c.id === this.data.formData.category_id);
          if (selectedCategory) {
            this.setData({ selectedCategory });
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch categories:', error);
        handleApiError(error);
        this.setData({ loading: false });
      });
  },
  
  handleTypeChange: function(e) {
    const type = e.detail.value;
    this.setData({
      'formData.type': type,
      'formData.category_id': 0,
      selectedCategory: null
    });
    
    // Fetch categories for the new type
    this.fetchCategories(type);
  },
  
  handleCategoryChange: function(e) {
    const index = e.detail.value;
    const category = this.data.categories[index];
    
    this.setData({
      selectedCategory: category,
      'formData.category_id': category.id
    });
  },
  
  handleDateChange: function(e) {
    this.setData({
      'formData.date': e.detail.value
    });
  },
  
  validateForm: function(formData) {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.category_id) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },
  
  handleSubmit: function(e) {
    const formData = e.detail.value;
    
    // Add category_id from state
    formData.category_id = this.data.formData.category_id;
    
    // Convert amount to number
    formData.amount = parseFloat(formData.amount);
    
    // Use date from state
    formData.date = this.data.formData.date;
    
    // Validate form
    if (!this.validateForm(formData)) {
      return;
    }
    
    this.setData({ loading: true });
    
    // Create or update transaction
    const apiCall = this.data.isEditing
      ? updateTransaction(this.data.transactionId, formData)
      : createTransaction(formData);
    
    apiCall
      .then(() => {
        wx.showToast({
          title: this.data.isEditing ? '更新成功' : '添加成功',
          icon: 'success'
        });
        
        // Return to previous page
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(error => {
        console.error('Failed to save transaction:', error);
        handleApiError(error);
        this.setData({ loading: false });
      });
  },
  
  handleCancel: function() {
    wx.navigateBack();
  },
  
  handleDelete: function() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这笔交易吗？此操作不可撤销。',
      confirmText: '删除',
      confirmColor: '#f5222d',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          deleteTransaction(this.data.transactionId)
            .then(() => {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              
              // Return to previous page
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            })
            .catch(error => {
              console.error('Failed to delete transaction:', error);
              handleApiError(error);
              this.setData({ loading: false });
            });
        }
      }
    });
  }
});
