Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 定义组件的属性，以便在外部设置
    imageSrc: {
      type: String,
      value: '' // 默认值为空
    },
    roomName: {
      type: String,
      value: ''
    },
    reserveUrl: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 这里可以定义组件内部使用的数据
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 这里定义组件内部的方法
    onTapReserve: function () {
      // 处理预约按钮点击事件
      wx.navigateTo({
        url: this.data.reserveUrl // 使用data中的reserveUrl属性作为跳转链接
      });
    }
  }
})
