const express = require('express');
const cookieParser = require('cookie-parser');
const loginRouter = require('./routes/login');
const currentUserRouter = require('./routes/currentUser');

const app = express();

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