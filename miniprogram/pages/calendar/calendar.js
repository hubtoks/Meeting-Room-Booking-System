const { formatTime, ajax } = require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    login_account:'',
    date:'',
  },

 
 async getDate(e){
  this.setData({
    date: formatTime(e.detail,'date'),
  });
  const {date} = this.data
  const params = {date}
  console.log(params)
  const { data } = await ajax('/reserve-collect-get','POST',params);
  console.log(data)
  this.setData({
    list:data,
  })
 },

  async toCancel(e) {
    wx.showModal({
      title: '注意',
      content: '确定取消预约吗？',
      success: async(res) => {//标注ASYNC才能使用await
        if (res.confirm) {
          // 在数据库查询id与openid对应的信息并删除
          const { info } = e.currentTarget.dataset;
          const { id } = info;
          const param ={id: id,openid: wx.getStorageSync('openid'),};
          const { data } = await ajax('/reserve-cancel','GET',param);
          if (data === "success!") {
              wx.showToast({
                title: '取消成功',
                icon: 'none',
              });}
          const result1 = await ajax('/reserve-collect-get','GET','');
         // 重新获取数据并设置到页面中
          this.setData({list: result1.data,});       
        }
      }
    })
  },

  toDetail(){
    wx.navigateTo({
      url: '../detail/detail',
    })
  },
  
  toLogin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },

  toIndex(){ 
    wx.switchTab({
      url: '../index/index',
    })
  },

 async onLoad(options) {
  this.calendarComponent = this.selectComponent('.calendar'); // 通过类名获取组件实例
  if (this.calendarComponent) {
    this.calendarComponent.reset(); // 调用 reset 方法重置选中的日期到默认值
  }
  //首次渲染取今日时间
  const now = new Date();
  this.setData({date:formatTime(now,'date')})
  const {date} = this.data
  const params = {date}
  const { data } = await ajax('/reserve-collect-get','POST',params);
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