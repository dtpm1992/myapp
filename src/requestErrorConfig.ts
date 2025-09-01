import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { history } from '@umijs/max';

// 读取 cookie 工具函数
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// 检查 session 是否为空
const isSessionEmpty = () => {
  const session = getCookie('session');
  return !session || session.trim() === '';
};

// 错误处理方案：错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      // 检查 session 是否为空，如果为空直接跳转首页
      if (isSessionEmpty() && window.location.pathname !== '/') {
        history.replace('/');
        return;
      }

      if (opts?.skipErrorHandler) throw error;
      
      // 我们的 errorThrower 抛出的错误
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // 保留原有重定向逻辑
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // 401 未授权时自动跳转首页
        if (error.response.status === 401) {
          history.replace('/');
          return;
        }
        // 其他状态码错误提示
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已发出但无响应
        message.error('None response! Please retry.');
      } else {
        // 请求发送失败
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，添加通用处理
      const url = config?.url?.concat('?token=123');
      return { ...config, url };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 先检查 session 是否为空
      if (isSessionEmpty() && window.location.pathname !== '/') {
        history.replace('/');
        return response;
      }

      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;
      if (data?.success === false) {
        message.error('请求失败！');
      }
      return response;
    },
  ],
};