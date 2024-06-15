import { ajax } from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username:'',
    password:'',
    confirmPwd:''
  },
  toLogin(){
    wx.redirectTo({
      url: '../login/login',
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
  getConfirmPwd(e){
    this.setData({  
      confirmPwd:e.detail.value 
    })
  },

  async submit(){
    const { username,password,confirmPwd } = this.data
    console.log(this.data)
    if(!username||!password||!confirmPwd){
      wx.showToast({
        title: '未填写必填项',
        icon:'error',
      });
      return;
    }else if(password !== confirmPwd){
      wx.showToast({
        title: '两次输入密码不一致！',
        icon:'none',
      })
      return;
    }else{
      const params = {
        openid:wx.getStorageSync('openid'),
        username,
        password,
        register_time:new Date().getTime()
      };
      const { data } = await ajax('/register','POST',params)
      if(data === "用户名已存在"){
        wx.showToast({
          title: '此账户已经被注册！',
          icon:'none',
        })
      }else if(data === "注册成功"){
        wx.redirectTo({
          url: '../login/login',
          success:()=>{
            wx.showToast({
              title: '注册成功！',
              icon:'none',
            })
          }
        })
      }
    }
  },

  async onLoad(options) {
    const openid = wx.getStorageSync('openid');//获取当前有无openid
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