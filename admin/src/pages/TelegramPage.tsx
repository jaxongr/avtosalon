import { useState } from 'react';
import { Card, Button, Input, Steps, message, Typography, Tag, Space, Alert, Row, Col } from 'antd';
import { PhoneOutlined, SafetyCertificateOutlined, CheckCircleOutlined, ApiOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

const userbotApi = {
  getStatus: () => client.get('/telegram-userbot/status'),
  sendCode: (phone: string) => client.post('/telegram-userbot/send-code', { phone }),
  verifyCode: (data: { phone: string; code: string; password?: string }) =>
    client.post('/telegram-userbot/verify-code', data),
};

export default function TelegramPage() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const qc = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['userbot-status'],
    queryFn: () => userbotApi.getStatus().then(r => r.data),
    refetchInterval: 10000,
  });

  const sendCodeMutation = useMutation({
    mutationFn: () => userbotApi.sendCode(phone),
    onSuccess: (res) => {
      if (res.data.success) {
        message.success('Kod yuborildi!');
        setStep(1);
      } else {
        message.error(res.data.message);
      }
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });

  const verifyMutation = useMutation({
    mutationFn: () => userbotApi.verifyCode({ phone, code, password: password || undefined }),
    onSuccess: (res) => {
      if (res.data.success) {
        message.success('Session ulandi!');
        setStep(2);
        qc.invalidateQueries({ queryKey: ['userbot-status'] });
      } else if (res.data.requires2FA) {
        setNeeds2FA(true);
        message.warning('2FA parol kerak');
      } else {
        message.error(res.data.message);
      }
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });

  return (
    <div>
      <Typography.Title level={3}>Telegram Sozlamalari</Typography.Title>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="Userbot holati">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text>Status: </Typography.Text>
                <Tag color={status?.connected ? 'green' : 'red'}>
                  {status?.connected ? 'Ulangan' : 'Ulanmagan'}
                </Tag>
              </div>

              {!status?.connected && (
                <Alert
                  type="info"
                  message="Telegram session ulanmagan"
                  description="Guruhlardan raqamlarni yig'ish uchun Telegram akkauntingizni ulang. Telefon raqamingizga kod yuboriladi."
                  showIcon
                />
              )}
            </Space>
          </Card>

          <Card title="Session ulash" style={{ marginTop: 16 }}>
            <Steps
              current={step}
              size="small"
              style={{ marginBottom: 24 }}
              items={[
                { title: 'Telefon', icon: <PhoneOutlined /> },
                { title: 'Kod', icon: <SafetyCertificateOutlined /> },
                { title: 'Tayyor', icon: <CheckCircleOutlined /> },
              ]}
            />

            {step === 0 && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text>Telegram telefon raqamingiz:</Typography.Text>
                <Input
                  size="large"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+998901234567"
                  prefix={<PhoneOutlined />}
                />
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={sendCodeMutation.isPending}
                  onClick={() => sendCodeMutation.mutate()}
                  disabled={!/^\+998\d{9}$/.test(phone)}
                >
                  Kod yuborish
                </Button>
              </Space>
            )}

            {step === 1 && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text>Telegram'dan kelgan kodni kiriting:</Typography.Text>
                <Input
                  size="large"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="12345"
                  prefix={<SafetyCertificateOutlined />}
                  maxLength={6}
                />

                {needs2FA && (
                  <>
                    <Typography.Text>2FA parolingiz:</Typography.Text>
                    <Input.Password
                      size="large"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="2FA parol"
                    />
                  </>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={verifyMutation.isPending}
                  onClick={() => verifyMutation.mutate()}
                  disabled={!code}
                >
                  Tasdiqlash
                </Button>
                <Button block onClick={() => { setStep(0); setCode(''); setNeeds2FA(false); }}>
                  Orqaga
                </Button>
              </Space>
            )}

            {step === 2 && (
              <Alert
                type="success"
                message="Session muvaffaqiyatli ulandi!"
                description="Endi monitoring guruhlari qo'shib, raqamlarni avtomatik yig'ish mumkin."
                showIcon
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Qanday ishlaydi?">
            <Steps
              direction="vertical"
              size="small"
              current={-1}
              items={[
                { title: 'Session ulash', description: 'Telegram akkauntingizni ulaysiz' },
                { title: 'Guruh qo\'shish', description: '"Guruhlar" sahifasida monitoring guruhlarini qo\'shing' },
                { title: 'Kalit so\'zlar', description: 'Har bir guruh uchun kalit so\'zlar belgilang (sotiladi, mashina...)' },
                { title: 'Avtomatik yig\'ish', description: 'Tizim guruhlardan raqamlarni avtomatik topadi' },
                { title: 'Lead yaratiladi', description: 'Topilgan raqamlar Lead sifatida saqlanadi' },
                { title: 'SMS yuboriladi', description: 'Avtomatik reklama SMS yuboriladi (SemySMS orqali)' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
