import { Modal, Form, Input, Tree, Button, message } from 'antd';
import React from 'react';
import { createRole, updateRole } from '../../service';
import type { RoleType, MenuTreeNode } from '../../data.d';

interface RoleFormProps {
  visible: boolean;
  menuTree: MenuTreeNode[];
  initialValues?: RoleType | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  visible,
  menuTree,
  initialValues,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  
  // 格式化树形结构用于Tree组件
  const formatTreeData = (nodes: MenuTreeNode[]): any[] => {
    return nodes.map(node => {
      const treeNode: any = {
        title: node.name || node.path,
        key: node.path,
        disabled: node.path === '/*' || node.path === '/', // 排除通配符和根路径
      };
      
      if (node.children && node.children.length) {
        treeNode.children = formatTreeData(node.children);
      }
      
      return treeNode;
    });
  };
  
  // 组件挂载时初始化表单
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        permissions: initialValues.permissions,
      });
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (initialValues) {
        // 更新角色
        await updateRole(initialValues.id, values);
        message.success('更新成功');
      } else {
        // 创建角色
        await createRole(values);
        message.success('创建成功');
      }
      
      onSuccess();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };
  
  return (
    <Modal
      title={initialValues ? '编辑角色' : '创建角色'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          确定
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ permissions: [] }}
      >
        <Form.Item
          name="name"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="角色描述"
        >
          <Input.TextArea rows={3} placeholder="请输入角色描述" />
        </Form.Item>
        
        <Form.Item
          name="permissions"
          label="可访问菜单"
          rules={[{ required: true, message: '请选择可访问菜单' }]}
        >
          <Tree
            checkable
            treeData={formatTreeData(menuTree)}
            placeholder="请选择菜单权限"
            showLine
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleForm;