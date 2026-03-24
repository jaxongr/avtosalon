import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Popconfirm } from 'antd';
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/monitored-groups');
      setGroups(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/monitored-groups/${id}`, { isActive: !isActive });
    fetchGroups();
  };

  const addAllGroups = async () => {
    try {
      const { data } = await api.post('/telegram/add-all-groups');
      message.success(data.message || `${data.added} ta guruh qo'shildi`);
      fetchGroups();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Xatolik');
    }
  };

  const deleteGroup = async (id: string) => {
    await api.delete(`/monitored-groups/${id}`);
    fetchGroups();
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={addAllGroups}>Barcha guruhlarni qo'shish</Button>
        <Button icon={<ReloadOutlined />} onClick={fetchGroups}>Yangilash</Button>
      </Space>

      <Table dataSource={groups} rowKey="id" loading={loading} size="small" columns={[
        { title: 'Nomi', dataIndex: 'title' },
        { title: 'Turi', dataIndex: 'type', render: (v: string) => <Tag color={v === 'CHANNEL' ? 'blue' : 'green'}>{v}</Tag> },
        { title: 'Leadlar', dataIndex: 'leadsCount', sorter: (a: any, b: any) => a.leadsCount - b.leadsCount },
        { title: 'Oxirgi xabar', dataIndex: 'lastMessageAt', render: (v: string) => v ? new Date(v).toLocaleString('uz') : '-' },
        { title: 'Holat', dataIndex: 'isActive', render: (v: boolean, r: any) => (
          <Tag color={v ? 'green' : 'red'} style={{ cursor: 'pointer' }} onClick={() => toggleActive(r.id, v)}>
            {v ? 'Aktiv' : 'O\'chiq'}
          </Tag>
        )},
        { title: '', render: (_: any, r: any) => (
          <Popconfirm title="O'chirishni tasdiqlang" onConfirm={() => deleteGroup(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )},
      ]} />
    </div>
  );
}
