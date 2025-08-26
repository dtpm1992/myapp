import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={<a href="lark://applink.feishu.cn/client/contact/department/view?departmentID=7303986601091268611" target="_blank">Powered by IDO</a>}
    />
  );
};

export default Footer;