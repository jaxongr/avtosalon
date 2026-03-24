import { useState, useEffect } from 'react';
import { Card, Button, Input, Steps, Alert, Space, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SendOutlined, PhoneOutlined, KeyOutlined, LockOutlined } from '@ant-design/icons';
import api from '../api';

export default function TelegramPage() {
  const [status, setStatus] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needPassword, setNeedPassword] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/telegram/status');
      setStatus(data);
    } catch {}
  };

  useEffect(() => { fetchStatus(); }, []);

  const sendCode = async () => {
    setLoading(true);
    try {
      await api.post('/telegram/send-code', { phone });
      setStep(1);
      message.success('Kod yuborildi!');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Kod yuborishda xatolik');
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/telegram/verify-code', { phone, code, password: password || undefined });
      if (data.needPassword) {
        setNeedPassword(true);
        message.info('2FA parol kerak');
      } else if (data.success) {
        message.success('Telegram ulandi!');
        setStep(2);
        fetchStatus();
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Kod noto\'g\'ri');
    }
    setLoading(false);
  };

  const scrapeNow = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/telegram/scrape-now', null, { params: { minutes: 60 } });
      message.success(`Scrape tugadi: ${data?.totalLeads || 0} ta yangi lead`);
    } catch (e: any) {
      message.error('Scrape xatolik');
    }
    setLoading(false);
  };

  return (
    <div>
      <Card title="Telegram Holati" style={{ marginBottom: 16 }}>
        {status?.connected ? (
          <Alert type="success" message="Telegram ulangan" icon={<CheckCircleOutlined />} showIcon />
        ) : (
          <Alert type="warning" message="Telegram ulanmagan — quyida ulanish kerak" icon={<CloseCircleOutlined />} showIcon />
        )}

        {status?.connected && (
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" onClick={scrapeNow} loading={loading}>Hozir Scrape qilish</Button>
            <Button onClick={() => api.post('/telegram/refresh-groups').then(() => message.success('Yangilandi'))}>Guruhlarni yangilash</Button>
          </Space>
        )}
      </Card>

      {!status?.connected && (
        <Card title="Telegram ulanish">
          <Steps current={step} items={[
            { title: 'Telefon', icon: <PhoneOutlined /> },
            { title: 'Kod', icon: <KeyOutlined /> },
            { title: 'Tayyor', icon: <CheckCircleOutlined /> },
          ]} style={{ marginBottom: 24 }} />

          {step === 0 && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                size="large"
                placeholder="+998901234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                prefix={<PhoneOutlined />}
              />
              <Button type="primary" size="large" onClick={sendCode} loading={loading} icon={<SendOutlined />} block>
                Kod yuborish
              </Button>
            </Space>
          )}

          {step === 1 && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                size="large"
                placeholder="Telegram'dan kelgan kod"
                value={code}
                onChange={e => setCode(e.target.value)}
                prefix={<KeyOutlined />}
              />
              {needPassword && (
                <Input.Password
                  size="large"
                  placeholder="2FA parol"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  prefix={<LockOutlined />}
                />
              )}
              <Button type="primary" size="large" onClick={verifyCode} loading={loading} icon={<CheckCircleOutlined />} block>
                Tasdiqlash
              </Button>
            </Space>
          )}

          {step === 2 && (
            <Alert type="success" message="Telegram muvaffaqiyatli ulandi! Monitoring boshlandi." showIcon />
          )}
        </Card>
      )}
    </div>
  );
}
