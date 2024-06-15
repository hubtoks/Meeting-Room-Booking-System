<template>
  <div class="body">
    <div class="top">
      <h2 class="h2">会议预约管理</h2>
    </div>
    <!-- 数据库表格展示id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, time -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="id"> </el-table-column>
      <el-table-column prop="openid" label="openid"> </el-table-column>
      <el-table-column prop="address" label="场地" width="60">
      </el-table-column>
      <el-table-column prop="title" label="标题"> </el-table-column>
      <el-table-column prop="meetingDate" label="会议日期" width="95">
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="60">
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="60">
      </el-table-column>
      <el-table-column prop="name" label="预约人"> </el-table-column>
      <el-table-column prop="phone" label="电话" width="110"> </el-table-column>
      <el-table-column prop="priority" label="优先级"> </el-table-column>
      <el-table-column prop="state" label="审核状态" width="100">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.state === 0"
            type="primary"
            @click="editState(scope.row)"
            >待审核</el-button
          >
          <el-tag v-if="scope.row.state === 1" type="success">已通过</el-tag>
          <el-tag v-if="scope.row.state === 2" type="danger">未通过</el-tag>
          <el-tag v-if="scope.row.state === 4" type="success">已调度</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="time" label="预约时间"> </el-table-column>
      <!-- 添加操作项 -->
      <el-table-column label="操作" width="170">
        <template slot-scope="scope">
          <el-button
            type="primary"
            style="margin-right: 5px"
            @click="editItem(scope.row)"
            >编辑</el-button
          >

          <el-popconfirm
            title="是否确认删除？不可恢复"
            @confirm="deleteItem(scope.row._id)"
          >
            <el-button type="danger" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件-->
    <el-pagination
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <!-- 弹窗组件，用于编辑或者新增 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      @close="handleClose"
    >
      <!-- address, title, meetingDate, startTime, endTime这些可编辑 -->
      <el-radio-group class="margin" v-model="address" size="small">
        <el-radio-button label="场地A"></el-radio-button>
        <el-radio-button label="场地B"></el-radio-button>
        <el-radio-button label="场地C"></el-radio-button>
        <el-radio-button label="场地D"></el-radio-button>
      </el-radio-group>
      <el-input
        class="margin"
        v-model="title"
        placeholder="请输入标题"
      ></el-input>
      <el-input
        class="margin"
        v-model="meetingDate"
        placeholder="请输入会议日期"
      ></el-input>
      <el-input
        class="margin"
        v-model="startTime"
        placeholder="请输入开始时间"
      ></el-input>
      <el-input
        class="margin"
        v-model="endTime"
        placeholder="请输入结束时间"
      ></el-input>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editMeet">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="是否通过审核？"
      :visible.sync="dialogVisible2"
      width="30%"
      @close="handleClose"
    >
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editStateBack(1)">通过审核</el-button>
        <el-button type="danger" @click="editStateBack(2)">退回申请</el-button>
      </span>
    </el-dialog>
  </div>
</template>
      
      <script>
import dayjs from "dayjs";
export default {
  data() {
    return {
      tableData: [],
      page: 1, //对应到elementui的分页组件默认展示页
      size: 5, //对应到elementui的分页组件每页默认展示数量
      total: 0,
      dialogVisible: false, //默认的弹窗状态为不显示，
      dialogVisible2: false,
      address: "this.tableData.address",
      title: "",
      meetingDate: "",
      startTime: "",
      endTime: "",
      _id: "",
      state: "",
      priority:"",
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    async getTableData() {
      const params = {
        page: this.page,
        size: this.size,
      };
      const {
        data: { result, total },
      } = await this.$http.post("/admin/reserve-check", params);
      this.tableData = result.map((item) => {
        return {
          //对返回的data做处理
          ...item,
          time: dayjs(item.time).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
      this.total = total;
    },
    handleSizeChange(val) {
      this.size = val; //改变每页展示数量
      this.getTableData(); // 重新获取数据
    },
    handleCurrentChange(val) {
      this.page = val; //改变当前页
      this.getTableData();
    },
    async deleteItem(_id) {
      const { data } = await this.$http.post("/delete-meet", { _id });
      if (data === "success!") {
        this.$message.success("删除成功");
        this.getTableData();
      } else {
        this.$message.error("删除失败");
      }
    },
    async editMeet() {
      //点击确认后向后台发送请求
      const { address, title, meetingDate, startTime, endTime, _id } = this;
      if (!address || !title || !meetingDate || !startTime || !endTime) {
        this.$message.error("请填写完整信息");
        return;
      }
      const { data } = await this.$http.post("/admin/editmeet", {
        address,
        title,
        meetingDate,
        startTime,
        endTime,
        _id,
      });
      if (data === "success!") {
        this.$message.success("编辑成功");
        this.dialogVisible = false;
        this.getTableData();
        this.address = "";
        this.title = "";
        this.meetingDate = "";
        this.startTime = "";
        this.endTime = "";
        this._id = "";
      } else if (data === "存在冲突的会议！") {
        this.$message.error("该时段已被预约！");
      } else {
        this.$message.error("编辑失败");
      }
    },
    editItem(item) {
      //点击编辑后将当前数据传给data
      this.dialogVisible = true;
      this.address = item.address;
      this.title = item.title;
      this.meetingDate = item.meetingDate;
      this.startTime = item.startTime;
      this.endTime = item.endTime;
      this._id = item._id;
    },
    editState(item) {
      this.dialogVisible2 = true;
      this._id = item._id;
      this.state = item.state;
      this.priority = item.priority;
      this.address = item.address;
      this.title = item.title;
      this.meetingDate = item.meetingDate;
      this.startTime = item.startTime;
      this.endTime = item.endTime;
    },
    async editStateBack(newstate) {
      const { _id } = this;
      const params = { _id, state: newstate };
      const { data } = await this.$http.post("/admin/change-state", params);
      if (data === "success!") {
        this.$message.success("操作成功");
        this.dialogVisible2 = false;
        this.getTableData();
      } else {
        this.$message.error("操作失败");
      }
      
    },
    handleClose() {
      //点击关闭按钮清空data
      this.address = "";
      this.title = "";
      this.meetingDate = "";
      this.startTime = "";
      this.endTime = "";
      this._id = "";
    },
  },
};
</script>
      
      <style lang="less" scoped>
.body {
  padding: 20px;
  background-color: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .el-input {
      width: 300px;
      margin-left: 20px;
    }
  }

  .pagination {
    margin-top: 20px;
  }
}

.margin {
  margin-bottom: 20px;
  //全部在左边
  display: flex;
  text-align: left;
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>