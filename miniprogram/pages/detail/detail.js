import { ajax } from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    background:['../../image/1.jpg','../../image/2.jpg','../../image/3.jpg','../../image/4.jpg'],
    list:[]
  },

  toReserve(){
    if (!!!wx.getStorageSync('login_account')) { 
      wx.showModal({
        title: '该功能需要注册，是否前往注册页？',
        content: '',
        complete: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../register/register',
            })
          }
        }
      })
    } else {
      const { title,address } = this.data;
      wx.navigateTo({
        url: `../reserve/reserve?address=${address}&title=${ title }`,
      })
    }
  },
  toReserveDetail(){
    const { title,address } = this.data;
      wx.navigateTo({
        url: `../reserveDetail/reserveDetail?address=${address}&title=${ title }`,
      })
  },
  toGetphone(){
    const { 0:{phone} } = this.data.list
    wx.showModal({
      title: '联系方式',
      content: phone,
      confirmText:"复制",
      complete: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: phone,
            success:(res) => {
              wx.showToast({
                title: '内容已复制',
                duration: 2000,
              })


            }
          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
 async onLoad(options) {
    const { title,address } = options;//接收页面传参
    const params = { title,address };//依次为依据向接口请求参数
    const { data } = await ajax('/room-info-detail','POST',params);
    this.setData({list:data})
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