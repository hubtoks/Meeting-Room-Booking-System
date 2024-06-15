<template>
  <div>
    <el-container>
      <el-header>
        <h2>会议室后台管理系统</h2>
        <div class="info">
          <p>{{ role }} {{ nickname }} 你好！</p>
          <el-button @click="quit">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px"
          ><el-menu
            :default-active="currentPath"
            class="el-menu-vertical-demo"
            @select="handleSelect"
          >
            <!-- :代表动态的选择 currentPath -->
            <el-menu-item index="/MeetRoom">
              <i class="el-icon-location"></i>
              <span slot="title">会议室管理</span>
            </el-menu-item>
            <el-menu-item index="/Meet">
              <i class="el-icon-menu"></i>
              <span slot="title">会议预约管理</span>
            </el-menu-item>
            <el-menu-item index="/User">
              <i class="el-icon-document"></i>
              <span slot="title">用户管理</span>
            </el-menu-item>
            <el-menu-item index="/Admin">
              <i class="el-icon-setting"></i>
              <span slot="title">管理员管理</span>
            </el-menu-item>
            <el-menu-item index="/Dispatch">
              <i class="el-icon-warning"></i>
              <span slot="title">预约冲突调度</span>
            </el-menu-item>
          </el-menu></el-aside
        >
        <!-- 展示二级页面用<router-view /> -->
        <el-main> <router-view /> </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import axios from "axios";
import Admin from "./Admin.vue";
export default {
  data() {
    return {
      role: "",
      nickname: "",
      currentPath: "/MeetRoom",
    };
  },
  created() {
    const userInfo = localStorage.getItem("userInfo");
    console.log(userInfo);
    if (userInfo) {
      const { role, nickname } = JSON.parse(userInfo);
      console.log(role, nickname);
      this.role = role === 0 ? "超级管理员" : "管理员"; // 0是超级管理员，1是普通管理员
      this.nickname = nickname;
    } else {
      this.$router.push("/");
    }
    const {path} = this.$route;
    this.currentPath = path;
  },
  methods: {
    quit() {
      localStorage.removeItem("useInfo");
      this.$router.push("/login"); //跳转到/login
    },
    async handleSelect(path) {
      if (path === "/Admin") {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const params = { username: userInfo.username };
        const { data } = await this.$http.post("/getAdminRole", params);
        console.log(data);
        if (data) {
          if (path !== this.currentPath) {
            this.$router.push(path); //跳转到path
            this.currentPath = path;
          }
        } else if (!data) {
          this.$message.error("您没有权限访问该页面");
        } else {
          this.$message.error("未知错误");
        }
      } else {
        if (path !== this.currentPath) {
          this.$router.push(path); //跳转到path
          this.currentPath = path;
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .info {
    display: flex;
    align-items: center;
  }
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  height: calc(100vh - 60px);
}

.el-menu-vertical-demo {
  height: 100%;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}
</style>