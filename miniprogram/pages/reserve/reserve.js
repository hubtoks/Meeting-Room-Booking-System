const { formatTime } = require("../../utils/util");
import { ajax } from '../../utils/util';
Page({
  data: {
    news:['感谢您使用会预约！','感谢您使用会预约！！','广告位招租！！！'],
    array: ['Low', 'Medium', 'High', 'Critical'],
    objectArray: [
      {
        id: 0,
        name: 'Low'
      },
      {
        id: 1,
        name: 'Medium'
      },
      {
        id: 2,
        name: 'High'
      },
      {
        id: 3,
        name: 'Critical'
      }
    ],
    index: 0,
    address:'',
    title:'',
    meetingDate: '', // 默认选取的会议日期
    startTime: '', // 默认选取的开始时间
    endTime: '', // 默认选取的结束时间
    nowDate: '', // 当前日期
    nowTime: '', // 当前时间
    name:'',
    phone:'',
    priority:'Low',
    list:[]
  },
//保证10分钟为间隔进行选择
tenMinute(timeString){
  const timeParts = timeString.split(':');//对接收到的进行分解  
  let hours = parseInt(timeParts[0], 10);
  let minutes = parseInt(timeParts[1], 10);//将字符串转换为整数,10表十进制数字
  // 避免分钟数超过60分钟，如有必要进位到下一小时
  if (minutes >= 51) { // 如果分钟数大于等于51
    hours += 1; // 将小时数加1
    minutes = 0; // 将分钟数重置为0
  }
  const tenMinute = Math.ceil(minutes / 10) * 10;//Math.ceil()向上取整数
  return `${hours.toString().padStart(2, '0')}:${(tenMinute < 10 ? '0' : '') + tenMinute}`;
  //对不满10分钟进行补0操作
},
//保证endtime大于startTime半小时
plusHalfHour(timeString) {
  const timeParts = timeString.split(':');
  let hours = parseInt(timeParts[0], 10);
  let minutes = parseInt(timeParts[1], 10);

  // 将分钟数增加30，如有必要进位到下一小时
  minutes += 30;
  if (minutes >= 60) {
    hours += 1;
    minutes -= 60;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
},
//设置默认时间
  setNowDateTime: function () {
    const now = new Date();
    const formattedDateTime = formatTime(now);// 使用formatTime函数字符串化date
    const [nowDate, nowTime] = formattedDateTime.split(' ');// 解构赋值提取日期和时间
    const tenMinute = this.tenMinute(nowTime);//调用10分钟化

    this.setData({
      meetingDate: nowDate,
      startTime: tenMinute,
      endTime: this.plusHalfHour(tenMinute),
      nowDate: nowDate,
      nowTime: tenMinute
    });
  },
  
  bindMeetingDateChange: function (e) {//限制可选日期，并根据日期判断可选时间
    
    const selectedDate = e.detail.value;//由于官方的是yyyy-mm-dd需要改一下
    const formattedDate = selectedDate.replace(/-/g, '/');
    this.setData({
      meetingDate: formattedDate
    });
    const {meetingDate} = this.data;

    const now = new Date();
    const formattedNowDate = formatTime(now, 'date');
    // 如果选择的日期是今天，则将会议开始时间的限制设置为当前时间之后
    if (meetingDate === formattedNowDate) {
      console.log('zhixing')
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour + ":" + currentMinute;
      this.setData({
        nowTime: currentTime
      });
    } else {
      // 否则，将会议开始时间的限制设置为全天可选
      this.setData({
        nowTime: "00:00"
      });
    }
    
  },
  
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
    //每次picker改变选择时，都将选中赋值给address，进而将选择信息上传数据库
    const number = e.detail.value
    const selectedPriority = this.data.array[number];
    this.setData({
      priority: selectedPriority,
    });
  },

  bindStartTimeChange: function (e) {
    const selectedTime = e.detail.value;
    const startTime = this.tenMinute(selectedTime);
    this.setData({
      startTime,
      endTime: this.plusHalfHour(startTime)
    });
  },
  bindEndTimeChange: function (e) {
    const selectedTime = e.detail.value;
    const endTime = this.tenMinute(selectedTime);
    const minEndTime = this.plusHalfHour(this.data.startTime);
    if (endTime < minEndTime) { // 如果选择的结束时间早于开始时间后半小时
      wx.showToast({
        title: '会议预约至少半小时',
        icon: 'none',
        duration: 2000
      });
      return; // 停止执行后续操作，保持结束时间不变
    }
    this.setData({
      endTime,
    });
  },

  getName(e){
    this.setData({
      name:e.detail.value
    })
  },
  getPhone(e){
    this.setData({
      phone:e.detail.value
    })
  },
 


  //这是数据第一次上传数据库，而取消预约需要数据库自身产生的数据标识_id来标识取消哪个会议，如果要实现取消预约功能，就需要新建一个表来存储数据库自身产生的_id,所以要先get请求数据库信息得到_id，把_id存起来（比如就叫id）再post存入数据库，将其存在一个新的表中，用于标识会议，所以做不到第一次上传就带id，这是一个悖论，{上传了才有id，要拿到id就要先上传，所以第一次不可能上传id}
  async Reserve() {
    const { address,title,meetingDate,startTime,endTime,name,phone,priority,} = this.data;
    if(!wx.getStorageSync('login_account')){
      wx.navigateTo({
        url: '../login/login',
      })
    }else if (!meetingDate || !startTime || !endTime || !name || !phone) {
      wx.showToast({
        title: '未填写必填项',
        icon: 'none',
      });
    } else if (!(/^1[3456789]\d{9}$/.test(this.data.phone))) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000
      });
    } else {
      const params ={address,title,meetingDate,startTime,endTime,name,phone,priority,
                    time: new Date().getTime(), };
      const result = await ajax('/reserve','POST',params)//首次存入
      const {data} = await ajax('/reserve-info','GET','')//首次请求
      const latest = data[data.length - 1];
     
      const params1 = {
        id: latest._id,
        openid:wx.getStorageSync('openid'),
        address:latest.address,
        title:latest.title,
        meetingDate: latest.meetingDate,
        startTime: latest.startTime,
        endTime: latest.endTime,
        name: latest.name,
        phone: latest.phone,
        priority: latest.priority,
        time: new Date().getTime(), 
      };
      const result2 = await ajax('/reserve-collect','POST',params1);//二次存入带id
      const data2 = result2.data;
      if(data2 === "存在冲突会议!"){
        wx.showModal({
          title: '温馨提示',
          content: '该时段存在已预约会议',
          cancelText:'预约其他',
          confirmText:'我要插队',
          complete: (res) => {
            if (res.confirm) {
              wx.showModal({
                title: '该操作将启用调度策略',
                content: '是否继续',
                complete: async (res) => {
                  if (res.confirm) {
                    const now = new Date();
                    const formattedNowDate = formatTime(now, 'date');
                   if(meetingDate === formattedNowDate){
                     wx.showToast({
                       title: '不能对当天的会议进行插队',
                       icon:'none'
                     })
                   }else{
                    const result3 = await ajax('/reserve-collect-insert','POST',params1);
                    console.log(result3.data)
                    if(result3.data === "插队失败！优先级不足"){
                      wx.showToast({
                        title: '插队失败！优先级不足',
                        icon:'none',
                      })
                    }else if(result3.data === 'success!'){
                      wx.showToast({
                        title: '已提交审核',
                        icon:'none'
                      })
                      {wx.switchTab({url: '../calendar/calendar',})}
                    }
                   }

                  }
                }
              })
            }
          }
        })
      }else{wx.switchTab({url: '../calendar/calendar',})}
    }             
  },

  onLoad(options) {
    this.setNowDateTime(); 
    const now = new Date();
    const formattedNowDate = formatTime(now, 'date');
    const formattedNowTime = formatTime(now, 'time');
    const { address,title,date } = options;//接收页面传参
    this.setData({
      address,
      title,
    })
    if(date === formattedNowDate){
      this.setData({
        meetingDate:date
      })
    }else{
      this.setData({
        meetingDate: date,
        startTime: '14:00',
        endTime: '14:30',
        nowDate: formattedNowDate,
        nowTime: '08:00',//可选范围
      });
    }

  },
  
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