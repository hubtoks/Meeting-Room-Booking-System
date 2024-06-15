<template>
    <div class="body">
        <img class="bg" src="../assets/bg.jpg" alt="">
        <div class="form">
            <h2 class="title">后台管理系统</h2>
            <el-input v-model="username" placeholder="请输入账号"></el-input>
            <el-input v-model="password" placeholder="请输入密码" show-password></el-input>
            <el-button @click="submit">登录</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                username:'',
                password:''
            }
        },
        methods:{
            async submit(){
                const {username,password}=this;
                //是否填写必填
                if(!username||!password){
                    this.$message.error('请填写账号和密码');
                    return;
                }
                const params={username,password};
                const {data} =await this.$http.post('/admin/login',params);
                //如果接受的是个对象，则存入缓存
                if(typeof data==='object') {
                    localStorage.setItem('userInfo',JSON.stringify(data));//存入缓存，把data对象转成字符串
                    this.$message.success('登录成功');
                    this.$router.push('/home');//跳转到首页
                }else{
                    this.$message.error("账号或密码错误");
                }
                console.log(data);
            }  
        }
    }
</script>

<style lang="less" scoped>
//让背景图片撑满
.body{
    width: 100%;
    height: 100%;
    position: absolute;
    .bg{
        width: 100%;
        height: 100%;
        z-index: 10;
    }
    .form{
        position: absolute;
        z-index: 11;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: rgba(255, 255, 255, 0.3);
        padding: 20px 30px;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .title{
            margin-bottom: 20px;
        }

        .el-input{
            margin-bottom: 20px;
            width: 300px;
        }

        .el-button{
            width: 100px;
        }
    }
}

</style>