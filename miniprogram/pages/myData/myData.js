// pages/myData/myData.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    nickName: '',
    phone: '',
    department: ''
  },

  inputNickname: function (e) {
    this.setData({
      nickName: e.detail.value
    })
  },

  inputPhone: function (e) {
    let phone = e.detail.value;
    // 限制用户只能输入11位数字
    if (phone.length > 11) {
      phone = phone.slice(0, 11);
    }
    this.setData({
      phone: phone
    })
  },

  inputDepartment: function (e) {
    this.setData({
      department: e.detail.value
    })
  },

  submitForm: function () {
    if (!this.data.nickName || !this.data.phone) {
      wx.showToast({
        title: '昵称和手机为必填项',
        icon: 'none',
        duration: 2000
      });
    }else if (!(/^1[3456789]\d{9}$/.test(this.data.phone))) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000
      });
    }else{
      //接收已存在userInfo
      const userInfo = this.data.userInfo;
      //修改其中的元素值
      userInfo.nickName = this.data.nickName;
      userInfo.phone = this.data.phone;
      //存回去
      wx.setStorageSync('userInfo', userInfo);
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.phone && userInfo.nickName) {
      this.setData({ 
        userInfo,
        phone:userInfo.phone,
        nickName:userInfo.nickName
       });
    }
  

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