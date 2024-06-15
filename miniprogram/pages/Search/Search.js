import { ajax } from '../../utils/util';
let t = null;
Page({

  /**
   * 页面的初始数据
   */

  data: {
    search:"",
    text:"",
    searchLog:[],
    searchRes:[]
  },

  deleteSearch(){
    this.setData({
      search:"",
      text:""
    });
  },
  
  deleteLog(){
    this.setData({
      searchLog:[]
    });
    wx.removeStorageSync('searchLog');
  },
 


  getSearch(e){
    //非防抖，及时响应,
    this.setData({
      text:e.detail.value
    });
    //实现防抖
    if(t) clearTimeout(t);//存在则清除,保证只有最后一次触发的事件会执行后续的操作
    t = setTimeout(async() =>{  
      this.setData({
        search:e.detail.value
      });
      if(e.detail.value){//仅非空时存入搜索历史
      //在防抖结束后记录搜索内容
        let searchLog = wx.getStorageSync('searchLog');
        if(searchLog){//有缓存时，将搜索值插入数组最前端（后）
          searchLog.unshift(e.detail.value);
        }else{          //无缓存时,将搜索值看做数组存入(先)
          searchLog = [e.detail.value];
        }
        //将采集到的搜索记录写入缓存中，并赋值给serachLog数组
        wx.setStorageSync('searchLog',searchLog);
        this.setData({
          searchLog
        })
      }//与后端交互进行模糊搜索
      const params = {title:e.detail.value};
      const {data} = await ajax('/room-search','GET',params);
      this.setData({
        searchRes:data
      })
    },1000);

  },
  
  toDetail(e){
    const { title } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../detail/detail?title=${title}`,
    })
  },

  onLoad(options) {
    //加载页面时加载缓存里的历史搜索记录
    const searchLog = wx.getStorageSync('searchLog');
    this.setData({
      searchLog
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