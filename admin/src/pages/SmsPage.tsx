import { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import api from '../api';

export default function SmsPage() {
  const [logs, setLogs] = useState<any>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/sms/logs', { params: { page, limit: 20 } })
      .then(({ data }) => setLogs(data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Table dataSource={logs.items} rowKey="id" loading={loading} size="small"
      pagination={{ current: page, total: logs.total, pageSize: 20, onChange: setPage }}
      columns={[
        { title: 'Telefon', dataIndex: 'phone' },
        { title: 'Xabar', dataIndex: 'message', ellipsis: true },
        { title: 'Holat', dataIndex: 'status', render: (v: string) => (
          <Tag color={v === 'SENT' ? 'green' : v === 'FAILED' ? 'red' : 'orange'}>{v}</Tag>
        )},
        { title: 'Sana', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('uz') },
      ]}
    />
  );
}
