// logs.js，用require导入util.js里的时间
const util = require('../../utils/util.js')

Component({
  data: {
    logs: []
  },
  lifetimes: {
    attached() {
      this.setData({
        logs: (wx.getStorageSync('logs') || []).map(log => {
          return {
            date: util.formatTime(new Date(log)),
            timeStamp: log
          }
        })
      })
    }
  },
})
