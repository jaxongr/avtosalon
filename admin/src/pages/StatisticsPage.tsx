import { Card, Typography, Row, Col, Statistic } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6B46C1', '#2DD4A8', '#1890ff', '#faad14', '#52c41a', '#ff4d4f'];

export default function StatisticsPage() {
  const { data: funnel } = useQuery({ queryKey: ['funnel'], queryFn: () => statsApi.getFunnel().then(r => r.data) });
  const { data: smsStats } = useQuery({ queryKey: ['sms-stats'], queryFn: () => statsApi.getSms().then(r => r.data) });
  const { data: trend } = useQuery({ queryKey: ['trend-60'], queryFn: () => statsApi.getTrend(60).then(r => r.data) });

  return (
    <div>
      <Typography.Title level={3}>Statistika</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Konversiya tunneli">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnel || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="status" width={100} />
                <Tooltip /><Bar dataKey="count" fill="#6B46C1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="SMS samaradorligi">
            <Row gutter={16}>
              <Col span={6}><Statistic title="Jami" value={smsStats?.total || 0} /></Col>
              <Col span={6}><Statistic title="Yuborilgan" value={smsStats?.sent || 0} valueStyle={{ color: '#52c41a' }} /></Col>
              <Col span={6}><Statistic title="Yetkazilgan" value={smsStats?.delivered || 0} valueStyle={{ color: '#1890ff' }} /></Col>
              <Col span={6}><Statistic title="Xato" value={smsStats?.failed || 0} valueStyle={{ color: '#ff4d4f' }} /></Col>
            </Row>
            <ResponsiveContainer width="100%" height={200} style={{ marginTop: 16 }}>
              <PieChart>
                <Pie data={[{ name: 'Sent', value: smsStats?.sent || 0 }, { name: 'Delivered', value: smsStats?.delivered || 0 }, { name: 'Failed', value: smsStats?.failed || 0 }]}
                  cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label>
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      <Card title="Leadlar trendi (60 kun)" style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={trend || []}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
            <Bar dataKey="count" fill="#2DD4A8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
