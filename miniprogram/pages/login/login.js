import { ajax } from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username:'',
    password:''
  },
  toReg(){
    wx.redirectTo({
      url: '../register/register',
    })
  },
  
  getUsername(e){
    this.setData({  
      username:e.detail.value 
    })
  },
  getPassword(e){
    this.setData({  
      password:e.detail.value 
    })
  },

  async submit(){
    const { username,password } = this.data
    console.log(this.data)
    if(!username||!password){
      wx.showToast({
        title: '未填写必填项',
        icon:'error',
      });
      return;
    }
    const params = { username,password };
    const { data } = await ajax('/login','POST',params)
    if(data === "用户名不存在"){
      wx.showToast({
        title: '用户名不存在',
        icon:'none',
      })
    }else if(data ==="密码错误"){
      wx.showToast({
        title: '密码错误',
        icon:'none',
      })
    }else if(data === "登录成功"){
      wx.setStorageSync('login_account', true);
      wx.setStorageSync('account', params);
      wx.switchTab({
        url: '../index/index',
        success:() =>{
          wx.showToast({
            title: '登录成功!',
            icon:'none',
          })
        }
      })
    }
  },








  async onLoad(options) {
    const openid = wx.getStorageSync('openid');//获取当前有无openid
    if(wx.getStorageSync('login_account')){
      wx.switchTab({
        url: '../index/index',
      })
    }
    if(!openid){//没有openid才执行获取openid
      const { code } = await wx.login() //改动过后，左边的代表成功所接收的值，故{code}代表成功值里的code部分
      const params1 = { code }  //声明要传入ajax方法的数据
      const result1 = await ajax('/openid','GET',params1) //result就相当于原本的res
      const{ data } = result1;//从res里取出取出openid
      if (data !== "error")
      wx.setStorageSync('openid', data);//存到缓存里
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