<template>
  <div class="body">
    <div class="top">
      <h2 class="h2">管理员管理</h2>
      <div>
        <el-button @click="dialogVisible = true">新增</el-button>
        <el-input
          placeholder="请输入账号名"
          prefix-icon="el-icon-search"
          v-model="search"
          @input="toSearch"
        >
        </el-input
        ><!-- v-model="search"存储在search里 @change非实时，要按enter触发 @input是实时搜索，对服务端消耗大，最好做防抖 -->
      </div>
    </div>
    <!-- 数据库表格展示 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="username" label="账号"> </el-table-column>
      <el-table-column prop="password" label="密码"> </el-table-column>
      <el-table-column prop="create_time" label="注册时间"> </el-table-column>
      <el-table-column prop="role" label="权限"> </el-table-column>
      <el-table-column prop="nickname" label="名称"> </el-table-column>
      <!-- 添加操作项 -->
      <el-table-column label="操作">
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
      <el-input
        class="margin"
        v-model="username"
        placeholder="请输入账户名"
      ></el-input>
      <el-input
        class="margin"
        v-model="password"
        placeholder="请输入密码"
      ></el-input>
      <el-radio-group class="margin" v-model="role">
        <el-radio :label="0">超级管理员</el-radio>
        <el-radio :label="1">管理员</el-radio>
      </el-radio-group>
      <el-input
        class="margin"
        v-model="nickname"
        placeholder="请输入管理员名称"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAdmin">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
    
    <script>
import { _ } from "core-js";
import dayjs from "dayjs";
import { debounce } from "lodash";
export default {
  data() {
    return {
      tableData: [],
      page: 1, //对应到elementui的分页组件默认展示页
      size: 5, //对应到elementui的分页组件每页默认展示数量
      total: 0,
      search: "",
      dialogVisible: false, //默认的弹窗状态为不显示，
      username: "",
      password: "",
      nickname: "",
      role: 0,
      _id: "",
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    async getTableData(search) {
      let params = {};
      if (search) {
        params = {
          page: this.page,
          size: this.size,
          search,
        };
      } else {
        params = {
          page: this.page,
          size: this.size,
        };
      }
      const {
        data: { result, total },
      } = await this.$http.post("/admin/getAdmin", params);

      this.tableData = result.map((item) => {
        return {
          //对返回的data做处理
          ...item,
          create_time: dayjs(item.create_time).format("YYYY-MM-DD HH:mm:ss"),
          role: item.role === 0 ? "超级管理员" : "普通管理员", //等于0是超级管理员，否则为普通管理员
        };
      });
      this.total = total;
      console.log(result);
    },
    handleSizeChange(val) {
      this.size = val; //改变每页展示数量
      this.getTableData(); // 重新获取数据
    },
    handleCurrentChange(val) {
      this.page = val; //改变当前页
      this.getTableData();
    },
    toSearch() {
      //debounce防抖,来自lodash拓展库
      let _search = debounce(() => this.getTableData(this.search), 2000);
      _search();
    },
    async deleteItem(_id) {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const params = {
        _id,
        username: userInfo.username,
      }; // 从当前登录的账户的缓存中取出账户名(唯一)用于后端鉴权
      const { data } = await this.$http.post("/delete-admin", params);
      if (data === "success!") {
        this.$message.success("删除成功");
        this.getTableData();
      } else if (data === "权限不足") {
        this.$message.error("权限不足");
      } else {
        this.$message.error("删除失败");
      }
    },
    async addAdmin() { //点击确认后向后台发送请求
      const { username, password, role, nickname, _id } = this;
      if (!username || !password || !nickname) {
        this.$message.error("请填写完整信息");
        return;
      }
      const { data } = await this.$http.post("/add-admin", {
        username,
        password,
        role,
        nickname,
        _id,
      });
      if (data === "success!") {
        this.$message.success(_id ? "编辑成功" : "添加成功"); // 判断是不是编辑
        this.dialogVisible = false;
        this.getTableData();
        this.username = "";
        this.password = "";
        this.nickname = "";
        this._id = "";
      } else {
        this.$message.error(_id ? "编辑失败" : "添加失败");
      }
    },
    editItem(item) {//点击编辑后将当前数据传给data
      const { _id, username, password, role, nickname } = item;
      this.username = username;
      this.password = password;
      this.role = role === "超级管理员" ? 0 : 1;
      this.nickname = nickname;
      this._id = _id;
      this.dialogVisible = true;
    },
    handleClose() {//点击关闭按钮清空data
      this.username = "";
      this.password = "";
      this.nickname = "";
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
</style>