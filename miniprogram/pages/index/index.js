import { ajax } from '../../utils/util';
Page({
  data: {
    background:['../../image/1.jpg','../../image/2.jpg','../../image/3.jpg','../../image/4.jpg'],
    select:0,
    siteOptions: ['场地A', '场地B', '场地C','场地D'],
    address:'场地A',
    list:[],
  },

  
 selectTab:async function(e){
    const {id} = e.currentTarget.dataset;
    this.setData({
      select:id,
      address: this.data.siteOptions[id]
    })
    console.log('address设置为',this.data.address);
    //切换场地时，重新获取
    const { address } = this.data;
    const params = { address };
    const { data } = await ajax('/room-info', 'GET', params);
    this.setData({ list: data });
  },

  toReserveDetail(e) {
      const { title } = e.currentTarget.dataset;
      console.log(title)
      const address = this.data.address
      wx.navigateTo({
        url: `../reserveDetail/reserveDetail?address=${address}&title=${ title }`,//要用``包裹实现页面传参,前为接收时调用的名字，后为要传的参数，不用相同
      })
  },
  toDetail(e){
    const { title } = e.currentTarget.dataset;
    const address = this.data.address
    wx.navigateTo({
      url: `../detail/detail?address=${address}&title=${ title }`,
    })
  },

onLoad: async function (options) {
  const openid = wx.getStorageSync('openid');//获取当前有无openid
  if(!openid){//没有openid才执行获取openid
    const { code } = await wx.login() //改动过后，左边的代表成功所接收的值，故{code}代表成功值里的code部分
    const params1 = { code }  //声明要传入ajax方法的数据
    const result1 = await ajax('/openid','GET',params1) //result就相当于原本的res
    const{ data } = result1;//从res里取出取出openid
    if (data !== "error")
    wx.setStorageSync('openid', data);//存到缓存里
  } 
  const { address } = this.data;
  const params = { address };
  const { data } = await ajax('/room-info','GET',params);
  this.setData({list:data})
},
    //未封装之前的代码
   // if(!openid){//没有openid才执行获取openid
    //   wx.login({
    //     success (res) {//wx.login的success里的code是申请用户openid的条件之一
    //       if (res.code) {//把code传给服务端
    //         wx.request({
    //           url: 'http://localhost:7788/login',
    //           data: {
    //             code: res.code
    //           },
    //           success:(res) =>{//服务端传回微信官方接口传回的openid
    //             const{ data } = res;//取出openid
    //             if (data !== "error")
    //             wx.setStorageSync('openid', data);//存到缓存里
    //           }
    //         })
    //       } else {
    //         console.log('登录失败！' + res.errMsg)
    //       }
    //     }
    //   })
    // } 

  onReady: function () {
    this.onLoad
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showToast({
      title: '我也是有底线的~',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})