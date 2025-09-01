import { LinkOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React, { useEffect } from 'react';
import {
  AvatarDropdown,
  AvatarName,
  Footer,
  Question,
  SelectLang,
} from '@/components';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';
import '@ant-design/v5-patch-for-react-19';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.CI;
const loginPath = '/user/login';

// 读取 cookie 工具函数
const getCookie = (name: string): string | null => {
  if (!document.cookie) return null;
  const cookies = document.cookie.split(';').map(c => c.trim());
  console.log(cookies)
  for (const cookie of cookies) {
    if (cookie.indexOf(`${name}=`) === 0) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

// 检查 session 是否为空
const isSessionEmpty = () => {
  const session = getCookie('session');
  console.log('当前 session 值:', session, '是否为空:', !session || session.trim() === '');
  return !session || session.trim() === '';
};




/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  // 检查 session 是否为空，为空则跳转到首页
  if (isSessionEmpty() && history.location.pathname !== loginPath) {
    history.replace(loginPath);
    return {
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }

  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (_error) {
      history.push(loginPath);
    }
    return undefined;
  };

  // 如果不是登录页面，执行
  const { location } = history;
  if (
    ![loginPath, '/user/register', '/user/register-result'].includes(
      location.pathname,
    )
  ) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// 全局点击事件处理
const setupGlobalClickHandler = () => {
  const handleGlobalClick = (e: MouseEvent) => {
    // 排除首页和登录相关页面
    const excludedPaths = ['/', loginPath, '/user/register', '/user/register-result'];
    if (excludedPaths.includes(history.location.pathname)) return;

    if (isSessionEmpty()) {
      e.preventDefault();
      e.stopPropagation();
      // 跳转到首页
      if (window.location.pathname !== '/') {
        history.replace('/');
      }
    }
  };

  // 监听全局点击（捕获阶段）
  document.addEventListener('click', handleGlobalClick, true);

  // 返回清理函数
  return () => {
    document.removeEventListener('click', handleGlobalClick, true);
  };
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  // 布局初始化时设置全局点击监听
  useEffect(() => {
    const cleanup = setupGlobalClickHandler();
    return cleanup;
  }, []);

  return {
    actionsRender: () => [
      <Question key="doc" />,
      <SelectLang key="SelectLang" />,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 页面切换时检查 session
      if (isSessionEmpty() && !['/', loginPath].includes(location.pathname)) {
        history.replace('/');
        return;
      }
      // 原有登录检查逻辑
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  withCredentials: true, // 允许跨域请求携带 Cookie
};
/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */