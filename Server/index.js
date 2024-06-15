const express = require('express');
const { Meet, MeetCollect, Room, User, Admin ,MeetConflict} = require('./db');
const axios = require('axios');
const bodyParser = require('body-parser');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

//创建服务器
const app = express();
//引入router
// const router=require('./router/index')
// app.use('/',router)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

app.all('*', (req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
})

//给前端的接口，测试用，能否链接
app.get('/hello', (req, res) => {
	res.send('success!');
})

//实现登录获取用户openid
app.get("/openid", async (req, res) => {
	const { code } = req.query;
	try {
		const { data: { openid } } = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wxd857b9be109b13cc&secret=ec612f9be65897b378d9617b6c4b13ab&js_code=${code}&grant_type=authorization_code `);
		res.send(openid);
	} catch (err) {
		console.log(err);
		res.send("error");
	}
})
//用于前端预约首次上传
app.post("/reserve", async (req, res) => {
	//获取前端的数据，将数据存入数据
	try {
		const { address, title, meetingDate, startTime, endTime, name, phone, priority, time } = req.body;
		await Meet.create({ address, title, meetingDate, startTime, endTime, name, phone, priority, time });//在Meet表里新建数据
		res.send('success!');
	} catch (err) {
		console.log(err);
		res.send("fail!");
	}
})
//前端接收res里最新的预约信息，用于前端二次上传
app.get("/reserve-info", async (req, res) => {
	const data = await Meet.find();
	res.send(data);
})
//用于前端预约二次上传，无冲突直接上传
app.post("/reserve-collect", async (req, res) => {
	try {
		const { id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, time } = req.body;// 检查数据库中是否存在相同 id 和 openid 的记录
		//根据address, title, meetingDate, startTime, endTime进行判断，当场地address，会议室title，会议日期meetingDate都相同时,判断两个会议的开始时间 startTime,到会议结束时间endTime是否冲突
		const conflictingMeetings = await checkConflict(address, title, meetingDate, startTime, endTime);
		if (conflictingMeetings.length > 0) {	
				return res.send('存在冲突会议!');
		} else {
			state = 0;//state为0表示审核中
			await MeetCollect.create({ id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, state, time });
			res.send('success!');
		}
	} catch (err) {
		console.error(err);
		res.status(500).send("fail!");
	}
});
//用于前端预约插队判断，有冲突选择插队
app.post("/reserve-collect-insert", async (req, res) => {
    const { id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, time } = req.body;
	console.log('接收到冲突会议，将进行调度处理')
    const conflictingMeetings = await checkConflict(address, title, meetingDate, startTime, endTime);
	console.log(conflictingMeetings)
	
    
    let allowInsert = true;
	
    for (const item of conflictingMeetings) {
        const existPriority = item.priority;    
        const compareResult = comparePriority(existPriority, priority);
		console.log(compareResult)
        if (compareResult) {//如果比较结果为真，则说明当前预约的优先级小于或等于数据库中已存在的预约，不允许插队
            allowInsert = false;
            break;
        }else{
			const id0 = item.id;//允许插队,记录并更改优先级小的会议信息，若更改，修改State=3
			//取出将要被改动的数据
			const minConflictMeet = await MeetCollect.findOne({id:id0});//结构出要修改的会议信息，传递给调度处理函数，实现会议的改动
			const { id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, state, time} = minConflictMeet;
			const newstate = 3;
			await MeetConflict.create({ id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, state:newstate, time });
			await MeetCollect.findOneAndDelete({id:id0});//删除
			
		}
    }

    if (allowInsert) {
        state = 0; // state为0表示审核中
        await MeetCollect.create({ id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, state, time });
		console.log('已成功插队')
        res.send('success!');
    } else {
		console.log('优先级不足')
        res.send('插队失败！优先级不足');
    }


	
});


//低优先冲突处理接口
app.post("/conflict-handle", async (req, res) => {
	const { id, openid, address, title, meetingDate, startTime, endTime, name, phone, priority, state, time } = req.body;
	//用dayjs转换为日期格式
	
	const originalStartTime = dayjs(`${meetingDate} ${startTime}`).format("YYYY/MM/DD HH:mm:ss")
	const originalEndTime = dayjs(`${meetingDate} ${endTime}`).format("YYYY/MM/DD HH:mm:ss")
	const data = await getConflictingMeetings(address, title, meetingDate, originalStartTime, originalEndTime,priority);
	console.log(data)
	res.send(data);
	const newstartTime = data.startTime;
	const newendTime = data.endTime;
	const newstate = 4;
	
	await MeetConflict.findOneAndUpdate({id:id},{state:newstate});//前面找谁，后面改谁
	
	await MeetCollect.create({ id, openid, address, title, meetingDate, startTime:newstartTime, endTime:newendTime, name, phone, priority, state:newstate, time });
})
//前段获取调度会议信息
app.post("/conflictMeeting", async (req, res) => {
    const {openid}=req.body;
	const data = await MeetConflict.find({openid:openid});
	res.send(data);
})
//前端获取调度后还会议信息
app.post("/dispatched-info", async (req, res) => {
    const {id,openid}=req.body;
	
	const data = await MeetCollect.find({id:id,openid:openid});
	

	res.send(data);
})



//用于前端动态渲染预约展示(根据日期)
app.post("/reserve-collect-get", async (req, res) => {
	const {date,address,title} = req.body; // 获取日期字符串
	const sort = { startTime: 1 };
	if ( date && address && title) {
		const data = await MeetCollect.find({ meetingDate: date,address:address,title:title}).sort(sort); 
		res.send(data);
	}else{
		const data = await MeetCollect.find({meetingDate: date}).sort(sort);
		res.send(data);
	}
})
//用户取消会议
app.get("/reserve-cancel", async (req, res) => {
	try {
		const { openid, id } = req.query;//接收标识符
		await MeetCollect.findOneAndDelete({
			id,
			openid
		});
		res.send('success!');
	} catch (err) {
		console.log(err);
	}
})

//管理员编辑会议室
app.post("/add-room", async (req, res) => {
    const { address, title, capacity, distance, deviceInfo: { 白板, 投影仪, 话筒, 音箱 }, addressDetail, phone, desc, time, _id } = req.body;

    try {
        if (_id) {
			//更新前取出
			const originalRoom = await Room.findById(_id);
            // 如果已存在进行更新（编辑）
            await Room.findByIdAndUpdate(_id, { address, title, capacity, distance, hasW: 白板, hasP: 投影仪, hasS: 话筒, hasM: 音箱, addressDetail, phone, desc, time });
			const updatedRoom = await Room.findById(_id);
            // 在更新 Room 表后，查找 MeetCollect 表中与更新前相同的记录，进行同步更新
			const addressOld = originalRoom.address;
			const titleOld = originalRoom.title;
			const addressNew = updatedRoom.address;
			const titleNew = updatedRoom.title;
			await MeetCollect.updateMany({ address: addressOld, title: titleOld }, { address: addressNew, title: titleNew });
            res.send('success!');
        } else {
            const result = await Room.findOne({ address, title });
            if (result) {
                // 如果 Room 表中已存在相同地址和标题的记录，则返回已存在的信息
                res.send("exist!");
            } else {
                // 如果 Room 表中不存在相同地址和标题的记录，则创建新记录
                await Room.create({ address, title, capacity, distance, hasW: 白板, hasP: 投影仪, hasS: 话筒, hasM: 音箱, addressDetail, phone, desc, time });
                res.send('success!');
            }
        }
    } catch (err) {
        console.error(err);
    }
})
//管理员删除会议室
app.post("/delete-room", async (req, res) => {
	const { _id } = req.body;
	try {
		await Room.findByIdAndDelete(_id);
		res.send('success!');
	} catch (err) {
		console.log(err);
	}
})
//管理员删除会议
app.post("/delete-meet", async (req, res) => {
	const { _id } = req.body;
	try {
		await MeetCollect.findByIdAndDelete(_id);
		res.send('success!');
	} catch (err) {
		console.log(err);
	}
})
//管理员手动编辑会议
app.post("/admin/editmeet", async (req, res) => {
	const { address, title, meetingDate, startTime, endTime, _id } = req.body;
	const conflictingMeetings = await checkConflict(address, title, meetingDate, startTime, endTime);
	
	if (conflictingMeetings.length > 0) {
		console.log('存在冲突的会议');
		return res.send('存在冲突的会议！');
	} else {
		await MeetCollect.findByIdAndUpdate(_id, { address, title, meetingDate, startTime, endTime });
		res.send('success!');
	}
})
//管理员手动调度会议
app.post("/admin/dispatchmeet", async (req, res) => {
	const { address, title, meetingDate, startTime, endTime, _id } = req.body;
	const conflictingMeetings = await checkConflict(address, title, meetingDate, startTime, endTime);
	
	if (conflictingMeetings.length > 0) {
		console.log('存在冲突的会议');
		return res.send('存在冲突的会议！');
	} else {
		await MeetConflict.findByIdAndUpdate(_id, { address, title, meetingDate, startTime, endTime });
		res.send('success!');
	}
})
//管理员审核
app.post("/admin/change-state", async (req, res) => {
	    const { _id, state } = req.body;
    	await MeetCollect.findByIdAndUpdate(_id, { state });
		res.send('success!');
})


//用于后台管理系统展示会议室信息
app.post("/admin/getRoom", async (req, res) => {
	try {
		const { size, page } = req.body;
		const result = await Room.find().limit(size).skip(size * (page - 1));//根据请求的页数与每页个数来返回数据库中不同的数据
		const total = await Room.countDocuments();//返回数据库中数据的个数
		res.send({ result, total });
	} catch (err) {
		console.error(err);
	}
})
//用于后台管理系统展示会议预约信息
app.post("/admin/reserve-check", async (req, res) => {
	try {
		const { size, page } = req.body;
		const result = await MeetCollect.find().limit(size).skip(size * (page - 1));//根据请求的页数与每页个数来返回数据库中不同的数据
		const total = await MeetCollect.countDocuments();//返回数据库中数据的个数
		res.send({ result, total });
	} catch (err) {
		console.error(err);
	}
})
//用于后台管理系统展示会议冲突信息
app.post("/admin/conflict-check", async (req, res) => {
	try {
		const { size, page } = req.body;
		const result = await MeetConflict.find().limit(size).skip(size * (page - 1));//根据请求的页数与每页个数来返回数据库中不同的数据
		const total = await MeetConflict.countDocuments();//返回数据库中数据的个数
		res.send({ result, total });
	} catch (err) {
		console.error(err);
	}
})

//用户数据
app.post("/admin/getUser", async (req, res) => {
	const { size, page, search } = req.body;
	try {
		if (search) {
			const username = new RegExp(search, 'i');//根据接受的search进行模糊查询，并将查询结果传给username
			const result = await User.find({ username }).limit(size).skip(size * (page - 1));
			const total = await User.countDocuments({});
			res.send({ result, total });
		} else {
			const result = await User.find().limit(size).skip(size * (page - 1));
			const total = await User.countDocuments();
			res.send({ result, total });
		}
	} catch (err) {
		console.error(err);
	}
})
//管理员数据
app.post("/admin/getAdmin", async (req, res) => {
	const { size, page, search } = req.body;
	try {
		if (search) {
			const username = new RegExp(search, 'i');//根据接受的search进行模糊查询，并将查询结果传给username
			const result = await Admin.find({ username }).limit(size).skip(size * (page - 1));
			const total = await Admin.countDocuments({});
			res.send({ result, total });
		} else {
			const result = await Admin.find().limit(size).skip(size * (page - 1));
			const total = await Admin.countDocuments();
			res.send({ result, total });
		}
	} catch (err) {
		console.error(err);
	}
})
//管理员删除自身账号
app.post("/delete-admin", async (req, res) => {
	const { _id, username } = req.body;

	try {
		const { role } = await Admin.findOne({ username });

		if (role === 1) {
			res.send('权限不足');
		} else {
			await Admin.findByIdAndDelete(_id);
			res.send('success!');
		}
	} catch (err) {
		console.log(err);
	}
})
//查询当前管理员权限
app.post("/getAdminRole", async (req, res) => {
	const { username } = req.body;
	try {
		const { role } = await Admin.findOne({ username });
		if (role === 0) {
			res.send(true);
		} else {
			res.send(false);
		}
	} catch (err) {
		console.log(err);
	}
})
//超管新增管理员
app.post("/add-admin", async (req, res) => {
	const { username, password, role, nickname, _id } = req.body;
	try {
		if (_id) {//如果已存在进行更新（编辑）
			await Admin.findByIdAndUpdate(_id, {
				username,
				password,
				role,
				nickname,
			})
			res.send('success!');
		} else {//如果不存在则新增
			await Admin.create({
				username,
				password,
				role,
				nickname,
				create_time: new Date().getTime()
			})
			res.send('success!');
		}

	} catch (err) {
		console.log(err);
	}

})

//用于前端不同场地动态渲染预约展示
app.get("/room-info", async (req, res) => {
	try {
		const { address } = req.query;//接收前端传来的不同数据来判断，取数据库里的哪个
		const data = await Room.find({
			address,
		});
		res.send(data);
	} catch (err) {
		console.log(err);
	}
})
//用于前端对应标题的详情页渲染
app.post("/room-info-detail", async (req, res) => {
	try {
		const { address, title } = req.body;//接收前端传来的不同数据来判断，取数据库里的哪个
		const data = await Room.find({
			title,
			address,
		});
		res.send(data);
	} catch (err) {
		console.log(err);
	}
})
//用于前端模糊搜索会议室
app.get("/room-search", async (req, res) => {
	try {
		const { title } = req.query;//接收前端传来的不同数据来判断，取数据库里的哪个
		const _title = new RegExp(title, 'i');//根据接受的title进行模糊查询，
		const data = await Room.find({
			title: _title
		});
		res.send(data);
	} catch (err) {
		console.log(err);
	}
})
//用户注册
app.post("/register", async (req, res) => {
	try {
		const { username, password, openid, register_time } = req.body;
		//查用户名是否被注册
		const result = await User.findOne({ username });
		if (result) {
			res.send("用户名已存在");
		} else {
			//创建新用户
			await User.create({ username, password, openid, register_time });
			res.send("注册成功");
		}
	} catch (err) {
		console.log(err);
	}
})
//用户登录
app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	//注册加了限制，用户名是唯一的，可以只找用户名，也有利于判断用户名是否存在
	if (user && user.password === password) {
		res.send("登录成功");
	} else if (!user) {
		res.send("用户名不存在");
	} else {
		res.send("密码错误");
	}
})
//管理员登录
app.post("/admin/login", async (req, res) => {
	const { username, password } = req.body;
	const admin = await Admin.findOne({ username });
	if (admin && admin.password === password) {
		res.send(admin);
	} else {
		res.send('error');
	}
})

//同一会议室冲突检测
async function checkConflict(address, title, meetingDate, startTime, endTime) {
	const conflictingMeetings = await MeetCollect.find({
	  address: address,
	  title: title,
	  meetingDate: meetingDate,
	  $or: [
		{
		  $and: [
			{ startTime: { $lt: endTime } },
			{ endTime: { $gt: startTime } }
		  ]
		},
		{
		  $and: [
			{ startTime: { $gte: startTime, $lt: endTime } },
			{ endTime: { $lte: endTime } }
		  ]
		},
		{
		  $and: [
			{ startTime: { $lte: startTime } },
			{ endTime: { $gte: endTime } }
		  ]
		}
	  ]//把priority和id取出来
	}, { priority: 1, id: 1 });
	
	return conflictingMeetings;
  }
//查询MeetCollect表里的相同address, title, meetingDate的会议的空余时段
async function getConflictingMeetings(address, title, meetingDate, originalStartTime, originalEndTime, priority) {
	let startTime = new Date(originalStartTime);
	let endTime = new Date(originalEndTime);
    let step = 10; // 初始步长为 10 分钟
	let startTimeBefore8 = false; // 标志表示开始时间是否早于早上 8 点
    let endTimeAfter22 = false; // 标志表示结束时间是否晚于晚上 10 点
    
    while (true) {
		if (startTime.getHours() < 8 || endTime.getHours() > 22) {//限制早八到晚十
            return null;
        }
        // 检查当前时间段是否存在冲突
        const conflictingMeetings = await checkConflict(address, title, meetingDate, dayjs(startTime).format("HH:mm"), dayjs(endTime).format("HH:mm"));

        // 如果不存在冲突，则返回当前时间段
        if (conflictingMeetings.length === 0 && startTime.getHours() >= 8 && endTime.getHours() <= 22) {
            return { startTime: dayjs(startTime).format("HH:mm"), endTime: dayjs(endTime).format("HH:mm") };
        }

        // 如果存在冲突，则继续调整时间段,由于是日期格式才可，需要转换成日期格式
        startTime.setTime(startTime.getTime() + step * 60 * 1000); // 减去步长
        endTime.setTime(endTime.getTime() + step * 60 * 1000); // 加上步长

        // 在每次调整时间段后，增加步长
        step += 10;

        // 每次循环交换增量的正负号
		step *= -1;     
		// if (startTime.getHours() < 8) {
        //     startTimeBefore8 = true;
        // }
        // if (endTime.getHours() > 22) {
        //     endTimeAfter22 = true;
        // }
        // if (startTimeBefore8 && endTimeAfter22) {
		// 	return title;
        // }

    }
	
}
//判断插队优先级与已存在优先级，当已存在的优先级大于等于插队优先级时，拒绝插队，返回true
  function comparePriority(existingPriority, newPriority) {
	const priorityWeights = {
	  'Low': 1,
	  'Medium': 2,
	  'High': 3,
	  'Critical': 4
	};
  
	const existingWeight = priorityWeights[existingPriority] || 0;
	const newWeight = priorityWeights[newPriority] || 0;
  
	return existingWeight >= newWeight;
  }

app.listen(7788, (res, req) => {
	console.log('服务端启动成功...');
	console.log('http//localhost:7788');
})