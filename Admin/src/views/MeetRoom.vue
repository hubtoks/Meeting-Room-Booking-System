<template>
  <div class="body">
    <div class="top">
      <h2 class="h2">会议室管理</h2>
      <el-button @click="dialogVisible = true">新增</el-button>
    </div>
    <!-- 数据库表格展示tableData获取到的数据 -->
    <el-table :data="tableData" border style="width: 100%">
      <!-- address,title,capacity,distance,addressDetail,phone,desc,deviceInfo这些数据 -->
      <el-table-column prop="address" label="场地"> </el-table-column>
      <el-table-column prop="title" label="标题"> </el-table-column>
      <el-table-column prop="capacity" label="容纳人数"> </el-table-column>
      <el-table-column prop="distance" label="距离"> </el-table-column>
      <el-table-column prop="addressDetail" label="详细地址"> </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="110">
      </el-table-column>
      <el-table-column prop="desc" label="备注"> </el-table-column>
      <el-table-column prop="deviceInfo" label="设备信息" width="150">
        <template slot-scope="scope">
          <span>
            白板: {{ scope.row.hasW ? "有" : "无" }} | 投影仪:
            {{ scope.row.hasP ? "有" : "无" }} 话筒:
            {{ scope.row.hasS ? "有" : "无" }} | 音箱:
            {{ scope.row.hasM ? "有" : "无" }}
          </span>
        </template>
      </el-table-column>
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
    <!-- 分页 -->
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
    <!-- 弹窗 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      @close="handleClose"
    >
      <!-- address,title,capacity,distance,addressDetail,phone,desc,deviceInfo这些数据 -->

      <el-radio-group class="margin" v-model="address" size="small">
        <el-radio-button label="场地A"></el-radio-button>
        <el-radio-button label="场地B"></el-radio-button>
        <el-radio-button label="场地C"></el-radio-button>
        <el-radio-button label="场地D"></el-radio-button>
      </el-radio-group>
      <el-input
        class="margin"
        v-model="title"
        placeholder="请输入会议室名称"
      ></el-input>
      <el-input
        class="margin"
        v-model="capacity"
        placeholder="请输入容纳人数"
      ></el-input>
      <el-input
        class="margin"
        v-model="distance"
        placeholder="请输入会议室距离"
      ></el-input>
      <el-input
        class="margin"
        v-model="addressDetail"
        placeholder="请输入会议室地址"
      ></el-input>
      <el-input
        class="margin"
        v-model="phone"
        placeholder="请输入会议室电话"
        maxlength="11"
      ></el-input>
      <div class="margin">
        <el-checkbox v-model="deviceInfo.白板">白板</el-checkbox>
        <el-checkbox v-model="deviceInfo.投影仪">投影仪</el-checkbox>
        <el-checkbox v-model="deviceInfo.话筒">话筒</el-checkbox>
        <el-checkbox v-model="deviceInfo.音箱">音箱</el-checkbox>
      </div>
      <el-input
        class="margin"
        v-model="desc"
        placeholder="请输入备注"
      ></el-input>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoom">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
      page: 1, //对应到elementui的分页组件默认展示页
      size: 5, //对应到elementui的分页组件每页默认展示数量
      total: 0,
      dialogVisible: false,
      address: "场地A",
      title: "",
      capacity: "",
      distance: "",
      addressDetail: "",
      phone: "",
      desc: "",
      deviceInfo: {
        白板: false,
        投影仪: false,
        话筒: false,
        音箱: false,
      },
      _id: "",
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
      } = await this.$http.post("/admin/getRoom", params);
      this.tableData = result;
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
      const { data } = await this.$http.post("/delete-room", { _id });
      if (data === "success!") {
        this.$message.success("删除成功");
        this.getTableData();
      } else {
        this.$message.error("删除失败");
      }
    },
    async addRoom() {
      const {
        address,
        title,
        capacity,
        distance,
        addressDetail,
        phone,
        desc,
        deviceInfo,
        _id,
      } = this;
      if (
        !address ||
        !title ||
        !capacity ||
        !distance ||
        !addressDetail ||
        !phone ||
        !deviceInfo
      ) {
        this.$message.error("请填写完整信息");
        return;
      } else if (!/^1[3-9]\d{9}$/.test(phone)) {
        this.$message.error("请输入正确的手机号");
        return;
      } else {
        const { data } = await this.$http.post("/add-room", {
          address,
          title,
          capacity,
          distance,
          addressDetail,
          phone,
          desc,
          deviceInfo,
          _id,
        });
        if (data === "success!") {
          this.$message.success(_id ? "编辑成功" : "添加成功");
          this.dialogVisible = false;
          this.getTableData();
          this.title = "";
          this.address = "";
          this.capacity = "";
          this.distance = "";
          this.addressDetail = "";
          this.phone = "";
          this.desc = "";
          this._id = "";
        } else if (data === "exist!") {
          this.$message.error("当前场地已存在同名会议室！");
        } else {
          this.$message.error(_id ? "编辑失败" : "添加失败");
        }
      }
    },
    editItem(item) {
      //点击编辑后将当前数据传给data
      this.dialogVisible = true;
      this.title = item.title;
      this.address = item.address;
      this.capacity = item.capacity;
      this.distance = item.distance;
      this.addressDetail = item.addressDetail;
      this.phone = item.phone;
      this.desc = item.desc;
      this.deviceInfo.音箱 = item.hasM;
      this.deviceInfo.投影仪 = item.hasP;
      this.deviceInfo.话筒 = item.hasS;
      this.deviceInfo.白板 = item.hasW;
      this._id = item._id;
    },
    handleClose() {
      this.title = "";
      this.capacity = "";
      this.distance = "";
      this.addressDetail = "";
      this.phone = "";
      this.desc = "";
      this._id = "";
    },
  },
};
</script>

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
</style>