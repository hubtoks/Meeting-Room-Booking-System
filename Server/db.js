const mongoose = require('mongoose');
//链接mongod数据库
mongoose.connect('mongodb://localhost:27017/MeetServer')//数据库名称
.then(()=>{
    console.log('数据库链接成功...')
})
.catch((err)=>{
    console.log('数据库链接失败...',err);
})

//会议预约总记录
const MeetSchemaA = new mongoose.Schema({
    address:{
        type: String,
    },
    title:{
        type: String,
    },
    meetingDate: {
        type: String, 
    },
    startTime: {
        type: String, 
    },
    endTime: {
        type: String, 
    },
    name: {
        type: String,
    },
    phone: {
        type: String, 
    },
    priority: {
        type: String,
        default: 'Low'
    },
    time:{
        type:Date,
    }
});
//用户预约表
const MeetSchemaB = new mongoose.Schema({
    id: {
        type:String,
    },
    openid: {
        type: String,
    },
    address:{
        type: String,
    },
    title:{
        type: String,
    },
    meetingDate: {
        type: String, 
    },
    startTime: {
        type: String, 
    },
    endTime: {
        type: String, 
    },
    name: {
        type: String,
    },
    phone: {
        type: String, 
    },
    priority: {
        type: String,
        default: 'Low'
    },
    state:{     //审核状态  0审核中 1审核通过 2审核未通过
        type:Number,
        default:0
    },
    time:{
        type:Date,
    }
});
////预约冲突处理表
const MeetSchemaConflict = new mongoose.Schema({
    id: {
        type:String,
    },
    openid: {
        type: String,
    },
    address:{
        type: String,
    },
    title:{
        type: String,
    },
    meetingDate: {
        type: String, 
    },
    startTime: {
        type: String, 
    },
    endTime: {
        type: String, 
    },
    name: {
        type: String,
    },
    phone: {
        type: String, 
    },
    priority: {
        type: String,
        default: 'Low'
    },
    state:{     //审核状态  0审核中 1审核通过 2审核未通过
        type:Number,
        default:0
    },
    time:{
        type:Date,
    }
});
//会议室信息表
const RoomSchema = new mongoose.Schema({
    address: {
        type: String,
    },
    title: {
        type: String,
    },
    capacity: {
        type: String, 
    },
    distance: {
        type: String, 
    },
    hasP: { 
        type: Boolean, 
        default: false 
    }, 
    hasW: { 
        type: Boolean, 
        default: false 
    }, 
    hasS: { 
        type: Boolean, 
        default: false 
    }, 
    hasM: { 
        type: Boolean, 
        default: false 
    }, 
    addressDetail: { 
        type: String, 
    }, 
    phone: { 
        type: String, 
    }, 
    desc: {
        type: String,
        default: ''
    },
    time:{
        type:Date,
    }
});
//用户账号
const UserSchema = new mongoose.Schema({
    openid: {
        type: String,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    register_time:{
        type:Number,
    }
})

//管理员账号
const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    create_time:{
        type:Number,
    },
    role:{//0超管 1管理
        type:Number,
    },
    nickname:{
        type:String,
    }
})



const Meet = mongoose.model('MeetInfo',MeetSchemaA);//最前为调用函数名，齐次是数据库表名称，最后是建表时的名称
const MeetCollect = mongoose.model('MeetInfoDelete',MeetSchemaB);
const Room = mongoose.model('RoomInfo',RoomSchema);
const User = mongoose.model('UserInfo',UserSchema); 
const Admin = mongoose.model('AdminInfo',AdminSchema);
const MeetConflict = mongoose.model('MeetConflict',MeetSchemaConflict);




module.exports={
    Meet,
    MeetCollect,
    Room,
    User,
    Admin,
    MeetConflict
}