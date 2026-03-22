import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  DashboardOutlined, TeamOutlined, CarOutlined, MessageOutlined,
  WechatWorkOutlined, UserOutlined, BarChartOutlined, LogoutOutlined,
  PhoneOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ApiOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/leads', icon: <TeamOutlined />, label: 'Leadlar' },
  { key: '/cars', icon: <CarOutlined />, label: 'Mashinalar' },
  { key: '/sms', icon: <MessageOutlined />, label: 'SMS' },
  { key: '/groups', icon: <WechatWorkOutlined />, label: 'Guruhlar' },
  { key: '/callbacks', icon: <PhoneOutlined />, label: 'Callback' },
  { key: '/statistics', icon: <BarChartOutlined />, label: 'Statistika' },
  { key: '/telegram', icon: <ApiOutlined />, label: 'Telegram' },
  { key: '/users', icon: <UserOutlined />, label: 'Foydalanuvchilar' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Typography.Title level={4} style={{ margin: 0, color: '#6B46C1' }}>
            {collapsed ? 'AS' : 'Avtosalon CRM'}
          </Typography.Title>
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems}
          onClick={({ key }) => navigate(key)} style={{ borderRight: 'none' }} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={{
            items: [
              { key: 'profile', label: user?.fullName, disabled: true },
              { key: 'role', label: `Role: ${user?.role}`, disabled: true },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Chiqish', onClick: logout },
            ],
          }}>
            <Avatar style={{ backgroundColor: '#6B46C1', cursor: 'pointer' }}>
              {user?.fullName?.[0] || 'A'}
            </Avatar>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
