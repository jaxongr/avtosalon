import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin } from 'antd';
import { TeamOutlined, CarOutlined, MessageOutlined, RiseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  NEW: '#1890ff', CONTACTED: '#faad14', INTERESTED: '#52c41a',
  NEGOTIATING: '#722ed1', SOLD: '#13c2c2', LOST: '#ff4d4f',
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => statsApi.getDashboard().then(r => r.data),
  });
  const { data: trend } = useQuery({
    queryKey: ['trend'],
    queryFn: () => statsApi.getTrend(30).then(r => r.data),
  });

  if (isLoading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  const overview = data?.overview || {};

  return (
    <div>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="Jami Leadlar" value={overview.totalLeads} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Bugun" value={overview.todayLeads} prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Mashinalar" value={overview.activeCars} prefix={<CarOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="SMS yuborilgan" value={overview.smsSent} prefix={<MessageOutlined />} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={14}>
          <Card title="Leadlar trendi (30 kun)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6B46C1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="Status bo'yicha">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data?.leadsByStatus?.map((s: any) => ({ name: s.status, value: s.count })) || []}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.leadsByStatus?.map((s: any, i: number) => (
                    <Cell key={i} fill={STATUS_COLORS[s.status] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      <Card title="So'nggi leadlar" style={{ marginTop: 16 }}>
        <Table dataSource={data?.recentLeads || []} rowKey="id" pagination={false} size="small"
          columns={[
            { title: 'Telefon', dataIndex: 'phone' },
            { title: 'Ism', dataIndex: 'name', render: (v: string) => v || '-' },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={STATUS_COLORS[s]}>{s}</Tag> },
            { title: 'Manba', dataIndex: 'source', render: (s: string) => <Tag>{s}</Tag> },
            { title: 'Sana', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString('uz-UZ') },
          ]} />
      </Card>
    </div>
  );
}
