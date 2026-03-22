import { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, Select, message, Typography, Tag, Switch, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../api/endpoints';

const categories = ['SEDAN', 'SUV', 'MINIVAN', 'HATCHBACK', 'COUPE', 'TRUCK', 'OTHER'];

export default function CarsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['cars'], queryFn: () => carsApi.getAll({ limit: 100 }).then(r => r.data) });

  const saveMutation = useMutation({
    mutationFn: (values: any) => editingCar ? carsApi.update(editingCar.id, values) : carsApi.create(values),
    onSuccess: () => { message.success(editingCar ? 'Yangilandi' : 'Yaratildi'); closeModal(); qc.invalidateQueries({ queryKey: ['cars'] }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Xatolik'),
  });

  const deleteMutation = useMutation({
    mutationFn: carsApi.delete,
    onSuccess: () => { message.success('O\'chirildi'); qc.invalidateQueries({ queryKey: ['cars'] }); },
  });

  const closeModal = () => { setModalOpen(false); setEditingCar(null); form.resetFields(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Mashinalar</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Yangi mashina</Button>
      </div>
      <Card>
        <Table loading={isLoading} dataSource={data?.data || []} rowKey="id" columns={[
          { title: 'Brend', dataIndex: 'brand' },
          { title: 'Model', dataIndex: 'model' },
          { title: 'Yil', dataIndex: 'year', width: 70 },
          { title: 'Narx ($)', dataIndex: 'price', render: (v: number) => Number(v).toLocaleString() },
          { title: 'Kategoriya', dataIndex: 'category', render: (v: string) => <Tag>{v}</Tag> },
          { title: 'Aktiv', dataIndex: 'isActive', width: 70, render: (v: boolean, record: any) => (
            <Switch size="small" checked={v} onChange={checked => carsApi.update(record.id, { isActive: checked }).then(() => qc.invalidateQueries({ queryKey: ['cars'] }))} />
          )},
          { title: 'Amallar', width: 100, render: (_: any, record: any) => (
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingCar(record); form.setFieldsValue(record); setModalOpen(true); }} />
              <Popconfirm title="O'chirilsinmi?" onConfirm={() => deleteMutation.mutate(record.id)}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )},
        ]} />
      </Card>
      <Modal title={editingCar ? 'Tahrirlash' : 'Yangi mashina'} open={modalOpen} onCancel={closeModal} onOk={() => form.submit()} width={600} confirmLoading={saveMutation.isPending}>
        <Form form={form} layout="vertical" onFinish={v => saveMutation.mutate(v)}>
          <Form.Item name="brand" label="Brend" rules={[{ required: true }]}><Input placeholder="Chevrolet" /></Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true }]}><Input placeholder="Malibu" /></Form.Item>
          <Space>
            <Form.Item name="year" label="Yil" rules={[{ required: true }]}><InputNumber min={1990} max={2030} style={{ width: 120 }} /></Form.Item>
            <Form.Item name="price" label="Narx ($)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: 150 }} /></Form.Item>
          </Space>
          <Form.Item name="category" label="Kategoriya" initialValue="SEDAN">
            <Select options={categories.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Space>
            <Form.Item name="color" label="Rang"><Input /></Form.Item>
            <Form.Item name="mileage" label="Yurgan (km)"><InputNumber min={0} /></Form.Item>
          </Space>
          <Space>
            <Form.Item name="engine" label="Dvigatel"><Input placeholder="2.0L Turbo" /></Form.Item>
            <Form.Item name="transmission" label="KPP"><Input placeholder="Automatic" /></Form.Item>
          </Space>
          <Form.Item name="description" label="Tavsif"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
