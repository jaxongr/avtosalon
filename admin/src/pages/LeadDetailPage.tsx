import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Timeline, Button, Select, Input, Space, message, Typography, Row, Col, Image } from 'antd';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://5.189.141.151:4010';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, smsApi, usersApi } from '../api/endpoints';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'blue', CONTACTED: 'gold', INTERESTED: 'green',
  NEGOTIATING: 'purple', SOLD: 'cyan', LOST: 'red',
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [smsText, setSmsText] = useState('');

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id], queryFn: () => leadsApi.getOne(id!).then(r => r.data), enabled: !!id,
  });
  const { data: managers } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) });

  const updateMutation = useMutation({
    mutationFn: (data: any) => leadsApi.update(id!, data),
    onSuccess: () => { message.success('Yangilandi'); qc.invalidateQueries({ queryKey: ['lead', id] }); },
  });
  const noteMutation = useMutation({
    mutationFn: () => leadsApi.addNote(id!, note),
    onSuccess: () => { message.success('Izoh qo\'shildi'); setNote(''); qc.invalidateQueries({ queryKey: ['lead', id] }); },
  });
  const smsMutation = useMutation({
    mutationFn: () => smsApi.send({ leadId: id!, message: smsText }),
    onSuccess: (res) => {
      if (res.data.skipped) message.warning('24 soat ichida SMS yuborilgan');
      else message.success('SMS yuborildi');
      setSmsText(''); qc.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'SMS xatoligi'),
  });

  if (isLoading || !lead) return null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/leads')}>Orqaga</Button>
        <Typography.Title level={4} style={{ margin: 0 }}>{lead.phone}</Typography.Title>
        <Tag color={STATUS_COLORS[lead.status]}>{lead.status}</Tag>
      </Space>
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card title="Lead ma'lumotlari">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Telefon">{lead.phone}</Descriptions.Item>
              <Descriptions.Item label="Ism">{lead.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Manba">{lead.source}</Descriptions.Item>
              <Descriptions.Item label="Guruh">{lead.sourceGroup || '-'}</Descriptions.Item>
              <Descriptions.Item label="Menejer">{lead.manager?.fullName || 'Tayinlanmagan'}</Descriptions.Item>
              <Descriptions.Item label="Score">{lead.score}</Descriptions.Item>
            </Descriptions>
            {lead.sourceMessage && (
              <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                <Typography.Text type="secondary">Xabar:</Typography.Text>
                <p>{lead.sourceMessage}</p>
              </div>
            )}
          </Card>

          {(lead.carBrand || lead.carPhotos?.length > 0) && (
            <Card title="Mashina ma'lumotlari" style={{ marginTop: 16 }}>
              {lead.carPhotos?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <Image.PreviewGroup>
                    <Space>
                      {lead.carPhotos.map((p: string, i: number) => (
                        <Image key={i} src={`${API_BASE}${p}`} width={120} height={90} style={{ objectFit: 'cover', borderRadius: 8 }} />
                      ))}
                    </Space>
                  </Image.PreviewGroup>
                </div>
              )}
              <Descriptions column={2} bordered size="small">
                {lead.carBrand && <Descriptions.Item label="Brend">{lead.carBrand}</Descriptions.Item>}
                {lead.carModel && <Descriptions.Item label="Model">{lead.carModel}</Descriptions.Item>}
                {lead.carYear && <Descriptions.Item label="Yil">{lead.carYear}</Descriptions.Item>}
                {lead.carPrice && <Descriptions.Item label="Narx">{lead.carPrice}</Descriptions.Item>}
                {lead.carColor && <Descriptions.Item label="Rang">{lead.carColor}</Descriptions.Item>}
                {lead.carMileage && <Descriptions.Item label="Probeg">{lead.carMileage}</Descriptions.Item>}
                {lead.carFuel && <Descriptions.Item label="Yoqilg'i">{lead.carFuel}</Descriptions.Item>}
                {lead.carTransmission && <Descriptions.Item label="KPP">{lead.carTransmission}</Descriptions.Item>}
              </Descriptions>
              {lead.senderName && <div style={{ marginTop: 8 }}><Tag>Yuboruvchi: {lead.senderName} {lead.senderUsername ? `@${lead.senderUsername}` : ''}</Tag></div>}
            </Card>
          )}
          <Card title="Amallar" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Typography.Text>Status:</Typography.Text>
                <Select value={lead.status} onChange={v => updateMutation.mutate({ status: v })} style={{ width: 160 }}
                  options={['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'SOLD', 'LOST'].map(s => ({ label: s, value: s }))} />
              </Space>
              <Space>
                <Typography.Text>Menejer:</Typography.Text>
                <Select value={lead.managerId} onChange={v => updateMutation.mutate({ managerId: v })} style={{ width: 200 }}
                  placeholder="Tanlang" allowClear options={managers?.map((m: any) => ({ label: m.fullName, value: m.id })) || []} />
              </Space>
            </Space>
          </Card>
          <Card title="Izoh qo'shish" style={{ marginTop: 16 }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Izoh yozing..." />
              <Button type="primary" onClick={() => noteMutation.mutate()} loading={noteMutation.isPending} disabled={!note}>Qo'shish</Button>
            </Space.Compact>
          </Card>
          <Card title="SMS yuborish" style={{ marginTop: 16 }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input value={smsText} onChange={e => setSmsText(e.target.value)} placeholder="SMS matn..." />
              <Button type="primary" icon={<SendOutlined />} onClick={() => smsMutation.mutate()} loading={smsMutation.isPending} disabled={!smsText}>Yuborish</Button>
            </Space.Compact>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Tarix">
            <Timeline items={lead.activities?.map((a: any) => ({
              color: a.action.includes('STATUS') ? 'blue' : a.action.includes('SMS') ? 'green' : 'gray',
              children: (
                <div>
                  <Typography.Text strong>{a.action}</Typography.Text><br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{a.details}</Typography.Text><br />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(a.createdAt).toLocaleString('uz-UZ')}{a.user && ` — ${a.user.fullName}`}
                  </Typography.Text>
                </div>
              ),
            })) || []} />
          </Card>
          {lead.smsMessages?.length > 0 && (
            <Card title="SMS tarix" style={{ marginTop: 16 }}>
              {lead.smsMessages.map((sms: any) => (
                <div key={sms.id} style={{ marginBottom: 8, padding: 8, background: '#f9f9f9', borderRadius: 6 }}>
                  <Tag color={sms.status === 'SENT' ? 'green' : sms.status === 'FAILED' ? 'red' : 'default'}>{sms.status}</Tag>
                  <Typography.Text style={{ fontSize: 12 }}>{sms.message.substring(0, 80)}...</Typography.Text><br />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{new Date(sms.createdAt).toLocaleString('uz-UZ')}</Typography.Text>
                </div>
              ))}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
