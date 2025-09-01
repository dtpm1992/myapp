// myapp/mock/permission.ts
import type { MockMethod } from 'vite-plugin-mock';
import { format, random } from 'date-fns';

const users: any[] = [
  {
    id: '1',
    name: '管理员',
    username: 'admin',
    roles: ['1'],
    createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    id: '2',
    name: '普通用户',
    username: 'user',
    roles: ['2'],
    createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  },
];

const roles: any[] = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: ['/*'],
    createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    id: '2',
    name: '普通用户',
    description: '拥有基础权限',
    permissions: ['/dashboard', '/dashboard/analysis', '/user/login'],
    createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  },
];

export default [
  // 用户列表
  {
    url: '/api/users',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: users,
      };
    },
  },
  // 更新用户角色
  {
    url: '/api/users/:id/roles',
    method: 'put',
    response: ({ body, params }) => {
      const index = users.findIndex((item) => item.id === params.id);
      if (index !== -1) {
        users[index].roles = body.roles;
        return {
          code: 200,
          message: '更新成功',
        };
      }
      return {
        code: 500,
        message: '用户不存在',
      };
    },
  },
  // 角色列表
  {
    url: '/api/roles',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: roles,
      };
    },
  },
  // 创建角色
  {
    url: '/api/roles',
    method: 'post',
    response: ({ body }) => {
      const newRole = {
        id: Date.now().toString(),
        ...body,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      };
      roles.push(newRole);
      return {
        code: 200,
        data: newRole,
        message: '创建成功',
      };
    },
  },
  // 更新角色
  {
    url: '/api/roles/:id',
    method: 'put',
    response: ({ body, params }) => {
      const index = roles.findIndex((item) => item.id === params.id);
      if (index !== -1) {
        roles[index] = { ...roles[index], ...body };
        return {
          code: 200,
          message: '更新成功',
        };
      }
      return {
        code: 500,
        message: '角色不存在',
      };
    },
  },
  // 删除角色
  {
    url: '/api/roles/:id',
    method: 'delete',
    response: ({ params }) => {
      const index = roles.findIndex((item) => item.id === params.id);
      if (index !== -1) {
        roles.splice(index, 1);
        return {
          code: 200,
          message: '删除成功',
        };
      }
      return {
        code: 500,
        message: '角色不存在',
      };
    },
  },
] as MockMethod[];