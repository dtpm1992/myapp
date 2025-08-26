const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken'); // 用于生成登录令牌（根据实际需求选择）

// 飞书配置（从环境变量或配置文件读取）
const FEISHU_CONFIG = {
  appId: 'cli_9f56c4e1cd3b900b',
  appSecret: 'dsaaaaaaaaaaaa',
  redirectUri: 'http://localhost:8000/callback/feishu',
};

/**
 * 飞书登录：用前端传递的 code 换取用户信息并完成登录
 */
router.post('/feishu', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ status: 'error', message: '缺少 code 参数' });
    }

    // 1. 用 code 换取飞书 access_token
    const tokenResp = await axios.post(
      'https://open.feishu.cn/open-apis/authen/v1/access_token',
      {
        app_id: FEISHU_CONFIG.appId,
        app_secret: FEISHU_CONFIG.appSecret,
        grant_type: 'authorization_code',
        code,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token, expires_in } = tokenResp.data;
    if (!access_token) {
      return res.status(401).json({ status: 'error', message: '飞书 token 获取失败' });
    }

    // 2. 用 access_token 获取飞书用户信息
    const userResp = await axios.get('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const feishuUser = userResp.data;
    if (!feishuUser.open_id) {
      return res.status(401).json({ status: 'error', message: '飞书用户信息获取失败' });
    }

    // 3. 关联本地用户（示例：自动创建用户，实际项目需根据业务逻辑处理）
    const localUser = await createOrGetLocalUser(feishuUser);

    // 4. 生成登录凭证（如 JWT）并返回
    const token = jwt.sign(
      { userId: localUser.id, username: localUser.name },
      'your_jwt_secret', // 替换为实际密钥
      { expiresIn: '24h' }
    );

    // 设置 cookie 或返回 token（根据项目登录逻辑）
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    // 返回与现有登录一致的格式
    res.json({
      status: 'ok',
      type: 'feishu',
      currentAuthority: localUser.role || 'user', // 权限角色
    });

  } catch (error) {
    console.error('飞书登录接口错误:', error);
    res.status(500).json({ status: 'error', message: '飞书登录异常' });
  }
});

/**
 * 关联本地用户（示例逻辑）
 * @param feishuUser 飞书用户信息
 */
async function createOrGetLocalUser(feishuUser) {
  // 实际项目中需连接数据库查询或创建用户
  const mockLocalUser = {
    id: `feishu_${feishuUser.open_id}`,
    name: feishuUser.name || '飞书用户',
    avatar: feishuUser.avatar_url,
    role: 'user', // 默认角色
  };
  return mockLocalUser;
}

module.exports = router;