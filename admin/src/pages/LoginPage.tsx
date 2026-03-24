import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import api from '../api';

export default function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      onLogin(data.accessToken);
      message.success('Kirish muvaffaqiyatli!');
    } catch {
      message.error('Email yoki parol xato');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title="Avtosalon Admin" style={{ width: 400 }}>
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item name="email" rules={[{ required: true }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Parol" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Kirish</Button>
        </Form>
      </Card>
    </div>
  );
}
