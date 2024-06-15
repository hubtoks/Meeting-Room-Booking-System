const { formatTime, ajax } = require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultDay:'',
    date:'',
    address:'',
    title:'',
  },
  
  toReserve(e) {
    if (!wx.getStorageSync('login_account')) { 
      wx.showModal({
        title: '该功能需要登录，是否前往登录页？',
        content: '',
        complete: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/login',
            })
          }
        }
      })
    } else { 
      const { title,address,date} = this.data;
      wx.navigateTo({
        url: `../reserve/reserve?address=${address}&title=${ title }&date=${date}`,//要用``包裹实现页面传参,前为接收时调用的名字，后为要传的参数，不用相同
      })
    }
  },

  async getDate(e){
    this.setData({
      date: formatTime(e.detail,'date'),
    });
    console.log(this.data.date)
    const {date,address,title} = this.data
    const params = {date,address,title}
    const { data } = await ajax('/reserve-collect-get','POST',params);
    this.setData({
      list:data,
    })
   },

  
  async onLoad(options) {
    const { address,title } = options;//接收页面传参
    this.setData({
      address,
      title,
    })
    const now = new Date();
    this.setData({date:formatTime(now,'date')})
    const {date} = this.data
    const params = {date,address,title}
    const { data } = await ajax('/reserve-collect-get','POST',params);
    this.setData({
      list:data,
      defaultDay: new Date().getDay(),
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