/**
 * 记账城市小程序应用实例
 * 
 * 小程序的全局入口文件，负责：
 * - 应用初始化
 * - 用户信息获取
 * - 全局数据管理
 */
App({
  /**
   * 小程序启动时执行的生命周期函数
   * 在这里进行应用的初始化设置
   */
  onLaunch: function () {
    // 展示本地存储能力 - 记录启动日志
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取用户信息 - 用于个性化显示
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  
  /**
   * 全局数据对象
   * 存储整个应用中需要共享的数据
   */
  globalData: {
    // 用户信息对象
    userInfo: null,
    // API服务器基础URL，生产环境应替换为实际服务器地址
    apiBaseUrl: 'http://localhost:8000'
  }
})
