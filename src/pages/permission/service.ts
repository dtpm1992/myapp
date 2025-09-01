// myapp/src/pages/permission/service.ts
import { request } from '@umijs/max';
import type { RoleType, UserType } from './data.d';

// 用户相关接口
export const getUserList = async () => {
  return request<{ data: UserType[] }>('/api/users', {
    method: 'GET',
  });
};

export const updateUserRoles = async (id: string, roles: string[]) => {
  return request(`/api/users/${id}/roles`, {
    method: 'PUT',
    data: { roles },
  });
};

// 角色相关接口
export const getRoleList = async () => {
  return request<{ data: RoleType[] }>('/api/roles', {
    method: 'GET',
  });
};

export const createRole = async (role: Omit<RoleType, 'id' | 'createdAt'>) => {
  return request('/api/roles', {
    method: 'POST',
    data: role,
  });
};

export const updateRole = async (id: string, role: Partial<RoleType>) => {
  return request(`/api/roles/${id}`, {
    method: 'PUT',
    data: role,
  });
};

export const deleteRole = async (id: string) => {
  return request(`/api/roles/${id}`, {
    method: 'DELETE',
  });
};
