<template>
  <div class="body">
    <div class="top">
      <h2 class="h2">用户管理</h2>
      <el-input
        placeholder="请输入用户名"
        prefix-icon="el-icon-search"
        v-model="search"
        @input="toSearch"
      >
      </el-input
      ><!-- v-model="search"存储在search里 @change非实时，要按enter触发 @input是实时搜索，对服务端消耗大，最好做防抖 -->
    </div>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="openid" label="OpenID"> </el-table-column>
      <el-table-column prop="username" label="账号"> </el-table-column>
      <el-table-column prop="password" label="密码"> </el-table-column>
      <el-table-column prop="register_time" label="注册时间"> </el-table-column>
    </el-table>
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
      } = await this.$http.post("/admin/getUser", params);
      this.tableData = result.map((item) => {
        return {
          ...item,
          register_time: dayjs(item.register_time).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
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
    }
  }

  .pagination {
    margin-top: 20px;
  }
}
</style>