const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    login:false,
    login_account:false,
    nickName:'',
    cellList: [
      {
        url:'../../icon/reserve.png',
        text:'我的预定',
        page:'../calendar/calendar'
      },
      {
        url:'../../icon/collection.png',
        text:'我的收藏',
        page:'../myCollection/myCollection'
      },
      {
        url:'../../icon/mydata.png',
        text:'通知',
        page:'../inform/inform'
      },
    ]
  },

  toDetail(e){
    
    const { page } =e.currentTarget.dataset;
    if(page === '../calendar/calendar'){
      wx.switchTab({
        url: page,
      })
    }else{
      wx.navigateTo({
        url: page,
      })
    }
      
  },

  toLogin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },

  toUnlogin(){
    wx.showModal({
      title: '注意',
      content: '确定退出吗?',
      complete: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('login');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('account');
          wx.removeStorageSync('login_account');
          this.setData({   //立刻执行退出到未登录页面状态
            avatarUrl: defaultAvatarUrl,
            login:false,
            login_account:false,
            nickName:'',
          })
          this.onShow();
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const login = wx.getStorageSync('login');//取出缓存里的登录状态
    const userInfo = wx.getStorageSync('userInfo');//取出缓存里的userInfo
    if(userInfo){
      const{ avatarUrl,nickName } = userInfo;
      this.setData({
        avatarUrl,
        nickName
      })
    }
    this.setData({
      login:!!login,    //取双反转为布尔类型，以防undefined也能成立
      login_account:!!wx.getStorageSync('login_account')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.onLoad();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})