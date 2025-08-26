const express = require('express');
const cookieParser = require('cookie-parser');
const loginRouter = require('./routes/login');
const currentUserRouter = require('./routes/currentUser');
const cors = require('cors'); 

const app = express();

// 配置 CORS，允许前端域名访问
app.use(cors({
  origin: 'http://localhost:8000', // 前端地址
  credentials: true, // 允许携带 cookie
}));

// 中间件
app.use(express.json());
app.use(cookieParser());

// 路由
app.use('/api/login', loginRouter);
app.use('/api/currentUser', currentUserRouter); // 获取当前用户信息接口

// 启动服务
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});