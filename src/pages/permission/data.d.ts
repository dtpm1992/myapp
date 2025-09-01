// myapp/src/pages/permission/data.d.ts
import type { Route } from '@umijs/max';

export interface UserType {
  id: string;
  name: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export interface RoleType {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // 存储可访问的路由path
  createdAt: string;
}

export interface MenuTreeNode extends Route {
  children?: MenuTreeNode[];
  key?: string;
  title?: string;
}