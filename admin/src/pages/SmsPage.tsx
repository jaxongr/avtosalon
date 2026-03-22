import { useState } from 'react';
import { Card, Table, Button, Switch, Modal, Form, Input, message, Typography, Tag, Space, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsApi } from '../api/endpoints';

export default function SmsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data: templates } = useQuery({ queryKey: ['sms-templates'], queryFn: () => smsApi.getTemplates().then(r => r.data) });
  const { data: history } = useQuery({ queryKey: ['sms-history'], queryFn: () => smsApi.getHistory().then(r => r.data) });
  const { data: settings } = useQuery({ queryKey: ['sms-settings'], queryFn: () => smsApi.getSettings().then(r => r.data) });

  const saveMutation = useMutation({
    mutationFn: (v: any) => editing ? smsApi.updateTemplate(editing.id, v) : smsApi.createTemplate(v),
    onSuccess: () => { message.success('Saqlandi'); closeModal(); qc.invalidateQueries({ queryKey: ['sms-templates'] }); },
  });
  const toggleMutation = useMutation({
    mutationFn: smsApi.toggleSms,
    onSuccess: () => { message.success('Yangilandi'); qc.invalidateQueries({ queryKey: ['sms-settings'] }); },
  });
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields(); };

  return (
    <div>
      <Typography.Title level={3}>SMS Boshqaruvi</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="Sozlamalar" style={{ marginBottom: 16 }}>
            <Space>
              <Typography.Text>Avtomatik SMS:</Typography.Text>
              <Switch checked={settings?.enabled} onChange={v => toggleMutation.mutate(v)} />
            </Space>
          </Card>
          <Card title="Shablonlar" extra={<Button icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Yangi</Button>}>
            {templates?.map((t: any) => (
              <Card key={t.id} size="small" style={{ marginBottom: 8 }} actions={[
                <EditOutlined onClick={() => { setEditing(t); form.setFieldsValue(t); setModalOpen(true); }} />,
                <Popconfirm title="O'chirilsinmi?" onConfirm={() => smsApi.deleteTemplate(t.id).then(() => qc.invalidateQueries({ queryKey: ['sms-templates'] }))}>
                  <DeleteOutlined />
                </Popconfirm>,
              ]}>
                <Typography.Text strong>{t.name}</Typography.Text>
                {t.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>Default</Tag>}
                <p style={{ margin: '8px 0 0', color: '#666', fontSize: 13 }}>{t.content}</p>
              </Card>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="SMS tarix">
            <Table dataSource={history || []} rowKey="id" size="small" pagination={{ pageSize: 10 }} columns={[
              { title: 'Telefon', dataIndex: 'phone', width: 130 },
              { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={s === 'SENT' ? 'green' : s === 'FAILED' ? 'red' : 'default'}>{s}</Tag>, width: 80 },
              { title: 'Xabar', dataIndex: 'message', render: (v: string) => v?.substring(0, 40) + '...' },
              { title: 'Sana', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleString('uz-UZ'), width: 130 },
            ]} />
          </Card>
        </Col>
      </Row>
      <Modal title={editing ? 'Tahrirlash' : 'Yangi shablon'} open={modalOpen} onCancel={closeModal} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={v => saveMutation.mutate(v)}>
          <Form.Item name="name" label="Nomi" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="content" label="Matn" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="isDefault" label="Default" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
