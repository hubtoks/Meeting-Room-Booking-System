// 获取时间
// 获取时间
const formatTime = (date, format = 'datetime') => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const dateFormat = [year, month, day].map(formatNumber).join('/');
  const timeFormat = [hour, minute].map(formatNumber).join(':');

  if (format === 'date') {
    return dateFormat;
  } else if (format === 'time') {
    return timeFormat;
  } else {
    return `${dateFormat} ${timeFormat}`;
  }
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

const ajax = (url ,method ,data) =>{//封装wx.request请求
  const base_url = "http://localhost:7788"
  //传入这四个
  return new Promise((resolve,reject)=> {
    wx.request({
      url: `${base_url}${url}`,
      method:method ? method : 'GET',
      data,
      success:(res)=> {resolve(res);},
      fail:(err)=> {reject(err);}
    })
  })
  
}

// 导出表达出的时间
module.exports = {
  formatTime,
  ajax
}
