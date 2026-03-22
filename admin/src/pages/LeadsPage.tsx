import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Tag, Input, Select, Space, Modal, Form, message, Typography, Row, Col, Statistic } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, DownloadOutlined, CarOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/endpoints';
import client from '../api/client';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'blue', CONTACTED: 'gold', INTERESTED: 'green',
  NEGOTIATING: 'purple', SOLD: 'cyan', LOST: 'red',
};

const CITIES = ['Toshkent','Samarqand','Buxoro','Andijon','Farg\'ona','Namangan','Qashqadaryo','Surxondaryo','Xorazm','Navoiy','Jizzax','Sirdaryo','Nukus','Chirchiq','Kokand','Margilan'];

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>();
  const [cityFilter, setCityFilter] = useState<string>();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, statusFilter, cityFilter],
    queryFn: () => leadsApi.getAll({ page, limit: 20, search, status: statusFilter, city: cityFilter }).then(r => r.data),
  });

  // Umumiy statistika
  const { data: stats } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => leadsApi.getStats().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => { message.success('Lead yaratildi'); setModalOpen(false); form.resetFields(); qc.invalidateQueries({ queryKey: ['leads'] }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });

  const exportExcel = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (cityFilter) params.set('city', cityFilter);
    if (search) params.set('search', search);
    window.open(`${client.defaults.baseURL}/leads/export/excel?${params.toString()}`, '_blank');
  };

  // Shahar bo'yicha hisob
  const cityStats = data?.data?.reduce((acc: Record<string, number>, lead: any) => {
    const c = lead.city || 'Noma\'lum';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Mashina brend bo'yicha
  const brandStats = data?.data?.reduce((acc: Record<string, number>, lead: any) => {
    if (lead.carBrand) acc[lead.carBrand] = (acc[lead.carBrand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Leadlar</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={exportExcel}>Excel yuklab olish</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Yangi Lead</Button>
        </Space>
      </div>

      {/* Umumiy statistika */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={8} sm={4}><Card size="small"><Statistic title="Jami" value={stats?.total || 0} prefix={<PhoneOutlined />} /></Card></Col>
        <Col xs={8} sm={4}><Card size="small"><Statistic title="Bugun" value={stats?.today || 0} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={8} sm={4}><Card size="small"><Statistic title="Yangi" value={stats?.byStatus?.find((s: any) => s.status === 'NEW')?._count || 0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        {Object.keys(cityStats).length > 0 && Object.entries(cityStats).slice(0, 3).map(([c, count]) => (
          <Col xs={8} sm={4} key={c}><Card size="small"><Statistic title={c} value={count as number} prefix={<EnvironmentOutlined />} /></Card></Col>
        ))}
      </Row>

      {/* Mashina brendlari */}
      {Object.keys(brandStats).length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {Object.entries(brandStats).map(([brand, count]) => (
            <Tag key={brand} color="purple" style={{ marginBottom: 4 }}><CarOutlined /> {brand}: {count as number}</Tag>
          ))}
        </div>
      )}

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="Qidirish..." prefix={<SearchOutlined />} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 200 }} />
          <Select placeholder="Status" allowClear value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }} style={{ width: 140 }}
            options={['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'SOLD', 'LOST'].map(s => ({ label: s, value: s }))} />
          <Select placeholder="Shahar" allowClear value={cityFilter} showSearch
            onChange={v => { setCityFilter(v); setPage(1); }} style={{ width: 150 }}
            options={CITIES.map(s => ({ label: s, value: s }))} />
          <Button icon={<DownloadOutlined />} onClick={exportExcel} size="small">Excel</Button>
        </Space>
        <Table loading={isLoading} dataSource={data?.data || []} rowKey="id"
          pagination={{ current: page, total: data?.meta?.total || 0, pageSize: 20, onChange: setPage, showTotal: (total) => `Jami: ${total}` }}
          scroll={{ x: 1100 }}
          columns={[
            { title: 'Telefon', dataIndex: 'phone', width: 140 },
            { title: 'Mashina', width: 160, render: (_: any, r: any) =>
              r.carBrand ? <span><strong>{r.carBrand}</strong> {r.carModel || ''} {r.carYear ? `(${r.carYear})` : ''}</span> : '-'
            },
            { title: 'Narx', dataIndex: 'carPrice', width: 100, render: (v: string) => v || '-' },
            { title: 'Shahar', dataIndex: 'city', render: (v: string) => v ? <Tag color="geekblue">{v}</Tag> : '-', width: 100 },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>, width: 95 },
            { title: 'Guruh', dataIndex: 'sourceGroup', width: 140, ellipsis: true, render: (v: string) => v || '-' },
            { title: 'Yuboruvchi', width: 120, render: (_: any, r: any) =>
              r.senderName || r.senderUsername ? <span>{r.senderName || ''}{r.senderUsername ? ` @${r.senderUsername}` : ''}</span> : '-'
            },
            { title: 'Sana', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString('uz-UZ'), width: 90 },
            { title: '', width: 45, render: (_: any, record: any) => <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/leads/${record.id}`)} /> },
          ]} />
      </Card>
      <Modal title="Yangi Lead" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} confirmLoading={createMutation.isPending}>
        <Form form={form} layout="vertical" onFinish={v => createMutation.mutate(v)}>
          <Form.Item name="phone" label="Telefon" rules={[{ required: true, pattern: /^\+998\d{9}$/, message: '+998XXXXXXXXX formatda' }]}>
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Form.Item name="name" label="Ism"><Input placeholder="Ali Valiyev" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
