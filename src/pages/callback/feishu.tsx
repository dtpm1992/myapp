// src/pages/callback/feishu.tsx
import { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import { useModel, history } from 'umi';
import { request } from '@umijs/max';

const FeishuCallback = () => {
  const [loading, setLoading] = useState(true);
  const { setInitialState } = useModel('@@initialState');

  useEffect(() => {
    // 解析 URL 中的 code 和 state 参数
    const urlParams = new URL(window.location.href).searchParams;
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('feishu_auth_state');

    // 验证 state 防止 CSRF 攻击
    if (state !== storedState) {
      message.error('登录验证失败，请重试');
      history.push('/user/login');
      return;
    }

    // 调用后端接口获取飞书用户信息并完成登录
    const handleFeishuLogin = async () => {
      try {
        setLoading(true);
        // 调用后端接口，用 code 换取用户信息和令牌
        const res = await request<API.LoginResult>('/api/login', {
          method: 'POST',
          data: { code },
        });

        if (res.status === 'ok') {
            // ... 更新用户状态 ...
            message.success('飞书登录成功');
            // 优先使用合法的 redirect 参数，默认跳转到首页
            const urlParams = new URL(window.location.href).searchParams;
            const redirect = urlParams.get('redirect') || '/'; // 确保 redirect 是应用内路径
            // 验证 redirect 是否为站内路径，避免跳转到外部资源
            if (redirect.startsWith('/') && !redirect.startsWith('//')) {
                history.push(redirect);
            } else {
                history.push('/'); // 非法地址时默认跳首页
            }
        } else {
          message.error(res.message || '飞书登录失败');
          history.push('/user/login');
        }
      } catch (error: any) {
        message.error(error.message || '飞书登录异常');
        history.push('/user/login');
      } finally {
        setLoading(false);
        // 清除本地存储的 state
        localStorage.removeItem('feishu_auth_state');
      }
    };

    if (code) {
      handleFeishuLogin();
    } else {
      message.error('缺少授权码，请重试');
      history.push('/user/login');
    }
  }, [setInitialState, history]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin spinning={loading} size="large">
        <p>飞书登录中...</p>
      </Spin>
    </div>
  );
};

export default FeishuCallback;