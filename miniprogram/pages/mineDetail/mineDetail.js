const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    nickName:'',
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },

  getNickname(e){
    this.setData({  
      nickName:e.detail.value 
    })
  },

  submit(){
    if (!this.data.nickName) {
      wx.showToast({
        title: '昵称为必填项',
        icon: 'none',
        duration: 2000
      });
    }else{
      const userInfo ={
        avatarUrl:this.data.avatarUrl,
        nickName:this.data.nickName
      }
      wx.setStorageSync('userInfo', userInfo);//将用户信息存入缓存
      wx.setStorageSync('login', true);//登入状态为TRUE
      this.setData({   //在加载页面前就设定为TRUE，否则要刷新才能显示另一个页面
        login:true,
        avatarUrl:this.data.avatarUrl,
        nickName:this.data.nickName
      })
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });
    }
  },

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
      login:!!login    //取双反转为布尔类型，以防undefined也能成立
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
    this.onLoad;
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