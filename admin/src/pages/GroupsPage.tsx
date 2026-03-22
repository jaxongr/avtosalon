import { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, Switch, message, Typography, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/endpoints';

export default function GroupsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['groups'], queryFn: () => groupsApi.getAll().then(r => r.data) });

  const saveMutation = useMutation({
    mutationFn: (v: any) => editing ? groupsApi.update(editing.id, v) : groupsApi.create(v),
    onSuccess: () => { message.success('Saqlandi'); closeModal(); qc.invalidateQueries({ queryKey: ['groups'] }); },
  });
  const deleteMutation = useMutation({
    mutationFn: groupsApi.delete,
    onSuccess: () => { message.success('O\'chirildi'); qc.invalidateQueries({ queryKey: ['groups'] }); },
  });
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Monitoring Guruhlari</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Yangi guruh</Button>
      </div>
      <Card>
        <Table loading={isLoading} dataSource={data || []} rowKey="id" columns={[
          { title: 'Nomi', dataIndex: 'title' },
          { title: 'Telegram ID', dataIndex: 'telegramId', render: (v: string) => <code>{v}</code> },
          { title: 'Kalit so\'zlar', dataIndex: 'keywords', render: (v: string[]) => v?.map((k: string) => <Tag key={k}>{k}</Tag>) || '-' },
          { title: 'Leadlar', dataIndex: 'leadsCount' },
          { title: 'Aktiv', dataIndex: 'isActive', render: (v: boolean, record: any) => (
            <Switch size="small" checked={v} onChange={checked => groupsApi.update(record.id, { isActive: checked }).then(() => qc.invalidateQueries({ queryKey: ['groups'] }))} />
          )},
          { title: 'Amallar', width: 100, render: (_: any, record: any) => (
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue({ ...record, keywords: record.keywords?.join(', ') }); setModalOpen(true); }} />
              <Popconfirm title="O'chirilsinmi?" onConfirm={() => deleteMutation.mutate(record.id)}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )},
        ]} />
      </Card>
      <Modal title={editing ? 'Tahrirlash' : 'Yangi guruh'} open={modalOpen} onCancel={closeModal} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={v => {
          const data = { ...v, keywords: typeof v.keywords === 'string' ? v.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : v.keywords };
          saveMutation.mutate(data);
        }}>
          <Form.Item name="telegramId" label="Telegram Group ID" rules={[{ required: true }]}><Input placeholder="-1001234567890" /></Form.Item>
          <Form.Item name="title" label="Guruh nomi" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="keywords" label="Kalit so'zlar (vergul bilan)"><Input placeholder="sotiladi, mashina, avto" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
