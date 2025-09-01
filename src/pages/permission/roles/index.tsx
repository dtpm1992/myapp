import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Modal, message, Popconfirm } from 'antd';
import React, { useState, useEffect } from 'react';
import { getRoleList, deleteRole } from '../service';
import RoleForm from './components/RoleForm';
import type { RoleType, MenuTreeNode } from '../data.d';
import routes from '../../../../config/routes';

// 格式化路由为树形结构
const formatRoutes = (routes: any[], parentPath = ''): MenuTreeNode[] => {
  return routes.map(route => {
    const currentPath = parentPath + route.path;
    const node: MenuTreeNode = {
      ...route,
      key: currentPath,
      path: currentPath,
      title: route.name,
    };
    
    if (route.routes && route.routes.length) {
      node.children = formatRoutes(route.routes, currentPath);
    }
    
    return node;
  });
};

const RoleList: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);
  
  const { data: roles = [], refresh: refreshRoles } = useRequest(getRoleList);
  
  // 初始化菜单树
  useEffect(() => {
    setMenuTree(formatRoutes(routes));
  }, []);
  
  const handleAdd = () => {
    setEditingRole(null);
    setVisible(true);
  };
  
  const handleEdit = (role: RoleType) => {
    setEditingRole(role);
    setVisible(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id);
      message.success('删除成功');
      refreshRoles();
    } catch (error) {
      message.error('删除失败');
    }
  };
  
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: RoleType) => (
        <div>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  
  return (
    <PageContainer title="角色管理">
      <ProTable
        dataSource={roles}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            新建角色
          </Button>,
        ]}
      />
      
      <RoleForm
        visible={visible}
        menuTree={menuTree}
        initialValues={editingRole}
        onCancel={() => setVisible(false)}
        onSuccess={() => {
          setVisible(false);
          refreshRoles();
        }}
      />
    </PageContainer>
  );
};

export default RoleList;