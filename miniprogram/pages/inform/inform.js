const { formatTime, ajax } = require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    login_account:'',
  },
  toLogin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  toCalendar(){
    wx.switchTab({
      url: '../calendar/calendar',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const params = {openid:wx.getStorageSync('openid')}
    const { data } = await ajax('/conflictMeeting','POST',params);
    for (let i = 0; i < data.length; i++) {
      // 根据id和openid去另一个表里查询现预定时间信息
      const params1 = {id:data[i].id, openid:wx.getStorageSync('openid')}
      const result = await ajax('/dispatched-info','POST',params1);
      const meetingInfo = result.data
      console.log(meetingInfo)
      // 如果查询到了信息，则将其添加到当前元素中
      if (meetingInfo.length > 0) {
        data[i].newMeetingDate = meetingInfo[0].meetingDate;
        data[i].newStartTime = meetingInfo[0].startTime;
        data[i].newEndTime = meetingInfo[0].endTime;
      }
    }
    this.setData({
      list:data,
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