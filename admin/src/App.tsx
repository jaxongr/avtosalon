import { useState, type ReactNode } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { PhoneOutlined, TeamOutlined, MessageOutlined, SettingOutlined, LoginOutlined, SendOutlined } from '@ant-design/icons';
import LoginPage from './pages/LoginPage';
import LeadsPage from './pages/LeadsPage';
import GroupsPage from './pages/GroupsPage';
import TelegramPage from './pages/TelegramPage';
import SmsPage from './pages/SmsPage';
import SettingsPage from './pages/SettingsPage';

const { Sider, Content } = Layout;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState('leads');
  const [collapsed, setCollapsed] = useState(false);

  if (!token) return <LoginPage onLogin={(t: string) => { localStorage.setItem('token', t); setToken(t); }} />;

  const pages: Record<string, ReactNode> = {
    leads: <LeadsPage />,
    groups: <GroupsPage />,
    telegram: <TelegramPage />,
    sms: <SmsPage />,
    settings: <SettingsPage />,
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{ height: 32, margin: 16, color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
            {collapsed ? 'A' : 'Avtosalon'}
          </div>
          <Menu theme="dark" selectedKeys={[page]} onClick={({ key }) => setPage(key)} items={[
            { key: 'leads', icon: <PhoneOutlined />, label: 'Leadlar' },
            { key: 'groups', icon: <TeamOutlined />, label: 'Guruhlar' },
            { key: 'telegram', icon: <SendOutlined />, label: 'Telegram' },
            { key: 'sms', icon: <MessageOutlined />, label: 'SMS' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Sozlamalar' },
          ]} />
          <div style={{ position: 'absolute', bottom: 16, width: '100%', textAlign: 'center' }}>
            <a onClick={() => { localStorage.removeItem('token'); setToken(null); }} style={{ color: '#ff4d4f' }}>
              <LoginOutlined /> {!collapsed && 'Chiqish'}
            </a>
          </div>
        </Sider>
        <Layout>
          <Content style={{ margin: 16, padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
            {pages[page] || <LeadsPage />}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
