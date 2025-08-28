import React, { useState } from 'react';
import { Button, Form, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { login } from '@/services/ant-design-pro/api';
import type { LoginParams } from '@/services/ant-design-pro/typings';
import styles from './index.less';

const LoginPage = () => {
  const [form] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [setSubmitting] = useState(false);

  // 飞书登录处理
  const handleFeishuLogin = () => {
    // 生成随机 state 防 CSRF
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('feishu_auth_state', state);
    
    // 飞书授权参数（替换为你的配置）
    const appId = 'cli_9f56c4e1cd3b900b'; // 飞书开放平台获取
    const redirectUri = encodeURIComponent('http://localhost:9000/login/callback'); // 回调地址（需在飞书配置）
    const authUrl = `https://open.feishu.cn/open-apis/authen/v1/index?app_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;
    
    window.location.href = authUrl;
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.title}>CostBoard</div>
        <Form
          form={form}
          name="login"
          layout="vertical"
        >
          {/* 飞书登录按钮 */}
          <div className={styles.otherLogin}>
            <Button
              type="default"
              icon={<UserOutlined />}
              onClick={handleFeishuLogin}
              block
              style={{ marginTop: 16 }}
            >飞书登录</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;