import { useState } from 'react';
import { Card, Button, Input, Steps, message, Typography, Tag, Space, Alert, Row, Col, Table, Popconfirm } from 'antd';
import { PhoneOutlined, SafetyCertificateOutlined, CheckCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { groupsApi } from '../api/endpoints';

const userbotApi = {
  getStatus: () => client.get('/telegram-userbot/status'),
  sendCode: (phone: string) => client.post('/telegram-userbot/send-code', { phone }),
  verifyCode: (data: { phone: string; code: string; password?: string }) =>
    client.post('/telegram-userbot/verify-code', data),
  getMyGroups: () => client.get('/telegram-userbot/my-groups'),
  refresh: () => client.post('/telegram-userbot/refresh'),
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

  const { data: myGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['my-groups'],
    queryFn: () => userbotApi.getMyGroups().then(r => r.data),
    enabled: !!status?.connected,
  });

  const { data: monitoredGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(r => r.data),
  });

  const sendCodeMutation = useMutation({
    mutationFn: () => userbotApi.sendCode(phone),
    onSuccess: (res) => {
      if (res.data.success) { message.success('Kod yuborildi!'); setStep(1); }
      else message.error(res.data.message);
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
        qc.invalidateQueries({ queryKey: ['my-groups'] });
      } else if (res.data.requires2FA) {
        setNeeds2FA(true);
        message.warning('2FA parol kerak');
      } else message.error(res.data.message);
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });

  const addGroupMutation = useMutation({
    mutationFn: (group: any) => groupsApi.create({
      telegramId: group.id,
      title: group.title,
      keywords: ['sotiladi', 'mashina', 'avto', 'sotuv'],
    }),
    onSuccess: () => {
      message.success('Guruh monitoring ro\'yxatiga qo\'shildi!');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });

  const refreshMutation = useMutation({
    mutationFn: () => userbotApi.refresh(),
    onSuccess: () => message.success('Monitoring yangilandi'),
  });

  const monitoredIds = new Set(monitoredGroups?.map((g: any) => g.telegramId) || []);

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
                <Alert type="info" message="Session ulanmagan" description="Quyida telefon raqamingiz bilan ulaning." showIcon />
              )}
            </Space>
          </Card>

          {!status?.connected && (
            <Card title="Session ulash" style={{ marginTop: 16 }}>
              <Steps current={step} size="small" style={{ marginBottom: 24 }} items={[
                { title: 'Telefon', icon: <PhoneOutlined /> },
                { title: 'Kod', icon: <SafetyCertificateOutlined /> },
                { title: 'Tayyor', icon: <CheckCircleOutlined /> },
              ]} />

              {step === 0 && (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input size="large" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998901234567" prefix={<PhoneOutlined />} />
                  <Button type="primary" size="large" block loading={sendCodeMutation.isPending}
                    onClick={() => sendCodeMutation.mutate()} disabled={!/^\+998\d{9}$/.test(phone)}>
                    Kod yuborish
                  </Button>
                </Space>
              )}

              {step === 1 && (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input size="large" value={code} onChange={e => setCode(e.target.value)} placeholder="12345" prefix={<SafetyCertificateOutlined />} maxLength={6} />
                  {needs2FA && <Input.Password size="large" value={password} onChange={e => setPassword(e.target.value)} placeholder="2FA parol" />}
                  <Button type="primary" size="large" block loading={verifyMutation.isPending}
                    onClick={() => verifyMutation.mutate()} disabled={!code}>Tasdiqlash</Button>
                  <Button block onClick={() => { setStep(0); setCode(''); setNeeds2FA(false); }}>Orqaga</Button>
                </Space>
              )}

              {step === 2 && <Alert type="success" message="Session ulandi!" description="Endi guruhlarni tanlang." showIcon />}
            </Card>
          )}
        </Col>

        <Col xs={24} md={12}>
          {status?.connected && (
            <Card title="Sizning guruhlaringiz" extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => qc.invalidateQueries({ queryKey: ['my-groups'] })}>Yangilash</Button>
                <Button type="primary" icon={<ReloadOutlined />} onClick={() => refreshMutation.mutate()} loading={refreshMutation.isPending}>
                  Monitoringni yangilash
                </Button>
              </Space>
            }>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                Kuzatmoqchi bo'lgan guruh/kanalni "Qo'shish" tugmasi bilan monitoring ro'yxatiga qo'shing.
              </Typography.Text>
              <Table
                loading={groupsLoading}
                dataSource={myGroups?.groups || []}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
                columns={[
                  { title: 'Nomi', dataIndex: 'title' },
                  { title: 'Turi', render: (_: any, r: any) => <Tag>{r.isChannel ? 'Kanal' : 'Guruh'}</Tag>, width: 80 },
                  { title: 'A\'zolar', dataIndex: 'participantsCount', width: 80 },
                  {
                    title: '', width: 100,
                    render: (_: any, record: any) => monitoredIds.has(record.id) ? (
                      <Tag color="green">Qo'shilgan</Tag>
                    ) : (
                      <Button size="small" type="primary" icon={<PlusOutlined />}
                        onClick={() => addGroupMutation.mutate(record)} loading={addGroupMutation.isPending}>
                        Qo'shish
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          )}

          <Card title="Qanday ishlaydi?" style={{ marginTop: 16 }}>
            <Steps direction="vertical" size="small" current={-1} items={[
              { title: 'Session ulash', description: 'Telegram akkauntingizni ulaysiz' },
              { title: 'Guruh tanlash', description: 'Ro\'yxatdan monitoring qilinadigan guruhlarni tanlaysiz' },
              { title: 'Kalit so\'zlar', description: '"Guruhlar" sahifasida kalit so\'zlarni sozlang' },
              { title: 'Avtomatik yig\'ish', description: 'Guruhlardan raqamlar avtomatik topiladi' },
              { title: 'Lead + SMS', description: 'Lead yaratiladi va avtomatik SMS yuboriladi' },
            ]} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
