import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Tag, Input, Select, Space, Modal, Form, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/endpoints';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'blue', CONTACTED: 'gold', INTERESTED: 'green',
  NEGOTIATING: 'purple', SOLD: 'cyan', LOST: 'red',
};

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

  const createMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => { message.success('Lead yaratildi'); setModalOpen(false); form.resetFields(); qc.invalidateQueries({ queryKey: ['leads'] }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Leadlar</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Yangi Lead</Button>
      </div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="Qidirish..." prefix={<SearchOutlined />} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 250 }} />
          <Select placeholder="Status" allowClear value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }} style={{ width: 150 }}
            options={['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'SOLD', 'LOST'].map(s => ({ label: s, value: s }))} />
          <Select placeholder="Shahar" allowClear value={cityFilter} showSearch
            onChange={v => { setCityFilter(v); setPage(1); }} style={{ width: 160 }}
            options={['Toshkent','Samarqand','Buxoro','Andijon','Farg\'ona','Namangan','Qashqadaryo','Surxondaryo','Xorazm','Navoiy','Jizzax','Sirdaryo','Nukus','Chirchiq','Kokand','Margilan'].map(s => ({ label: s, value: s }))} />
        </Space>
        <Table loading={isLoading} dataSource={data?.data || []} rowKey="id"
          pagination={{ current: page, total: data?.meta?.total || 0, pageSize: 20, onChange: setPage }}
          columns={[
            { title: 'Telefon', dataIndex: 'phone', width: 150 },
            { title: 'Ism', dataIndex: 'name', render: (v: string) => v || '-' },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>, width: 120 },
            { title: 'Shahar', dataIndex: 'city', render: (v: string) => v ? <Tag color="geekblue">{v}</Tag> : '-', width: 120 },
            { title: 'Manba', dataIndex: 'source', render: (s: string) => <Tag>{s}</Tag>, width: 140 },
            { title: 'Menejer', dataIndex: ['manager', 'fullName'], render: (v: string) => v || 'Tayinlanmagan' },
            { title: 'Sana', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleString('uz-UZ'), width: 160 },
            { title: '', width: 50, render: (_: any, record: any) => <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/leads/${record.id}`)} /> },
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
