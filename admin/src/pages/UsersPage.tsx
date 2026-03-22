import { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Switch, message, Typography, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/endpoints';

export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) });

  const saveMutation = useMutation({
    mutationFn: (v: any) => editing ? usersApi.update(editing.id, v) : usersApi.create(v),
    onSuccess: () => { message.success('Saqlandi'); closeModal(); qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Foydalanuvchilar</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Yangi foydalanuvchi</Button>
      </div>
      <Card>
        <Table loading={isLoading} dataSource={data || []} rowKey="id" columns={[
          { title: 'Username', dataIndex: 'username' },
          { title: 'Ism', dataIndex: 'fullName' },
          { title: 'Rol', dataIndex: 'role', render: (r: string) => <Tag color={r === 'ADMIN' ? 'red' : 'blue'}>{r}</Tag> },
          { title: 'Telegram ID', dataIndex: 'telegramId', render: (v: string) => v || '-' },
          { title: 'Aktiv', dataIndex: 'isActive', render: (v: boolean, record: any) => (
            <Switch size="small" checked={v} onChange={checked => usersApi.update(record.id, { isActive: checked }).then(() => qc.invalidateQueries({ queryKey: ['users'] }))} />
          )},
          { title: 'Amallar', width: 100, render: (_: any, record: any) => (
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }} />
              <Popconfirm title="O'chirilsinmi?" onConfirm={() => usersApi.delete(record.id).then(() => qc.invalidateQueries({ queryKey: ['users'] }))}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )},
        ]} />
      </Card>
      <Modal title={editing ? 'Tahrirlash' : 'Yangi foydalanuvchi'} open={modalOpen} onCancel={closeModal} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={v => saveMutation.mutate(v)}>
          <Form.Item name="username" label="Username" rules={[{ required: !editing, min: 3 }]}><Input disabled={!!editing} /></Form.Item>
          <Form.Item name="password" label="Parol" rules={[{ required: !editing, min: 6 }]}><Input.Password /></Form.Item>
          <Form.Item name="fullName" label="To'liq ism" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="role" label="Rol" initialValue="MANAGER">
            <Select options={[{ label: 'Admin', value: 'ADMIN' }, { label: 'Manager', value: 'MANAGER' }]} />
          </Form.Item>
          <Form.Item name="telegramId" label="Telegram ID"><Input placeholder="123456789" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
