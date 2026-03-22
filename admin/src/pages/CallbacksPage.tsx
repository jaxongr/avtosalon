import { Table, Card, Button, Tag, message, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callbacksApi } from '../api/endpoints';

export default function CallbacksPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['callbacks'], queryFn: () => callbacksApi.getAll().then(r => r.data) });
  const handleMutation = useMutation({
    mutationFn: callbacksApi.markHandled,
    onSuccess: () => { message.success('Bajarildi'); qc.invalidateQueries({ queryKey: ['callbacks'] }); },
  });

  return (
    <div>
      <Typography.Title level={3}>Callback so'rovlari</Typography.Title>
      <Card>
        <Table loading={isLoading} dataSource={data || []} rowKey="id" columns={[
          { title: 'Telefon', dataIndex: 'phone' },
          { title: 'Ism', dataIndex: 'name', render: (v: string) => v || '-' },
          { title: 'Xabar', dataIndex: 'message', render: (v: string) => v || '-' },
          { title: 'Lead', dataIndex: ['lead', 'phone'] },
          { title: 'Status', dataIndex: 'isHandled', render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? 'Bajarildi' : 'Kutilmoqda'}</Tag> },
          { title: 'Sana', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleString('uz-UZ') },
          { title: 'Amal', render: (_: any, record: any) => !record.isHandled && (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleMutation.mutate(record.id)}>Bajarildi</Button>
          )},
        ]} />
      </Card>
    </div>
  );
}
