const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * 获取当前登录用户信息
 */
router.get('/', (req, res) => {
  try {
    // 从 cookie 或 header 中获取 token
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: '未登录' });
    }

    // 验证 token（实际项目需从数据库查询用户信息）
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const userInfo = {
      name: decoded.username,
      avatar: 'https://picsum.photos/200', // 示例头像
      userid: decoded.userId,
      access: 'user', // 权限
    };

    res.json({ data: userInfo });
  } catch (error) {
    res.status(401).json({ error: '登录已过期' });
  }
});

module.exports = router;