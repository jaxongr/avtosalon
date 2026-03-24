import { useState, useEffect } from 'react';
import { Table, Tag, Input, Card, Row, Col, Statistic, Space, Button, Modal, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, PhoneOutlined, CarOutlined } from '@ant-design/icons';
import api from '../api';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any>({ items: [], total: 0 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads', { params: { page, limit: 20, search: search || undefined } });
      setLeads(data);
    } catch {}
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/leads/stats');
      setStats(data);
    } catch {}
  };

  useEffect(() => { fetchLeads(); }, [page, search]);
  useEffect(() => { fetchStats(); }, []);

  const columns = [
    { title: 'Telefon', dataIndex: 'phone', render: (v: string) => <a href={`tel:${v}`}>{v}</a> },
    { title: 'Brand', dataIndex: 'brand', render: (v: string) => v || '-' },
    { title: 'Model', dataIndex: 'model', render: (v: string) => v || '-' },
    { title: 'Yil', dataIndex: 'year', render: (v: number) => v || '-' },
    { title: 'Narx', render: (_: any, r: any) => r.priceAmount ? `${r.priceAmount} ${r.priceCurrency || ''}` : '-' },
    { title: 'Shahar', dataIndex: 'city', render: (v: string) => v || '-' },
    { title: 'Guruh', dataIndex: 'sourceGroup', render: (v: any) => v?.title || '-' },
    { title: 'SMS', dataIndex: 'smsSent', render: (v: boolean) => v ? <Tag color="green">Yuborildi</Tag> : <Tag>Yo'q</Tag> },
    { title: 'Sana', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('uz') },
    { title: '', render: (_: any, r: any) => <Button size="small" onClick={() => setSelectedLead(r)}>Ko'rish</Button> },
  ];

  return (
    <div>
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="Jami leadlar" value={stats.total} prefix={<PhoneOutlined />} /></Card></Col>
          <Col span={6}><Card><Statistic title="Bugun" value={stats.today} prefix={<CarOutlined />} /></Card></Col>
        </Row>
      )}

      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Qidirish..." prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} allowClear />
        <Button icon={<ReloadOutlined />} onClick={() => { fetchLeads(); fetchStats(); }}>Yangilash</Button>
      </Space>

      <Table
        dataSource={leads.items}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total: leads.total, pageSize: 20, onChange: setPage }}
        size="small"
        scroll={{ x: 1200 }}
      />

      <Modal open={!!selectedLead} onCancel={() => setSelectedLead(null)} footer={null} title="Lead tafsilotlari" width={700}>
        {selectedLead && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Telefon">{selectedLead.phone}</Descriptions.Item>
            <Descriptions.Item label="Brand">{selectedLead.brand || '-'}</Descriptions.Item>
            <Descriptions.Item label="Model">{selectedLead.model || '-'}</Descriptions.Item>
            <Descriptions.Item label="Yil">{selectedLead.year || '-'}</Descriptions.Item>
            <Descriptions.Item label="Narx">{selectedLead.priceAmount ? `${selectedLead.priceAmount} ${selectedLead.priceCurrency}` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Rang">{selectedLead.color || '-'}</Descriptions.Item>
            <Descriptions.Item label="Probeg">{selectedLead.mileage || '-'}</Descriptions.Item>
            <Descriptions.Item label="Yoqilgi">{selectedLead.fuelType || '-'}</Descriptions.Item>
            <Descriptions.Item label="Korobka">{selectedLead.transmission || '-'}</Descriptions.Item>
            <Descriptions.Item label="Holat">{selectedLead.condition || '-'}</Descriptions.Item>
            <Descriptions.Item label="Kredit">{selectedLead.creditAvailable ? 'Ha' : '-'}</Descriptions.Item>
            <Descriptions.Item label="Shahar">{selectedLead.city || '-'}</Descriptions.Item>
            <Descriptions.Item label="Yuboruvchi">{selectedLead.senderName || selectedLead.senderUsername || '-'}</Descriptions.Item>
            <Descriptions.Item label="SMS">{selectedLead.smsSent ? 'Yuborildi' : 'Yo\'q'}</Descriptions.Item>
            <Descriptions.Item label="Xabar" span={2}><div style={{ maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 12 }}>{selectedLead.rawMessage}</div></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
