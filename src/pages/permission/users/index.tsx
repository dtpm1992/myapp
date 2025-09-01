// myapp/src/pages/permission/users/index.tsx
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Table, Tag, Button, Modal, Select, message } from 'antd';
import React, { useState } from 'react';
import { getUserList, getRoleList, updateUserRoles } from '../service';
import type { UserType, RoleType } from '../data.d';

const UserList: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  const { data: users = [], refresh: refreshUsers } = useRequest(getUserList);
  const { data: roles = [] } = useRequest(getRoleList);
  
  const handleAssignRoles = (user: UserType) => {
    setCurrentUser(user);
    setSelectedRoles([...user.roles]);
    setVisible(true);
  };
  
  const handleSubmit = async () => {
    if (!currentUser) return;
    
    try {
      await updateUserRoles(currentUser.id, selectedRoles);
      message.success('角色分配成功');
      setVisible(false);
      refreshUsers();
    } catch (error) {
      message.error('角色分配失败');
    }
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      key: 'roles',
      render: (_, record: UserType) => (
        <>
          {record.roles.map(roleId => {
            const role = roles.find(r => r.id === roleId);
            return role ? (
              <Tag key={roleId} color="blue">{role.name}</Tag>
            ) : null;
          })}
        </>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: UserType) => (
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => handleAssignRoles(record)}
        >
          分配角色
        </Button>
      ),
    },
  ];
  
  return (
    <PageContainer title="用户清单">
      <Table 
        dataSource={users} 
        columns={columns} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title="分配角色"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSubmit}
      >
        {currentUser && (
          <div>
            <p>用户: {currentUser.name}</p>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 16 }}
              placeholder="请选择角色"
              value={selectedRoles}
              onChange={setSelectedRoles}
            >
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default UserList;