import { useState, useEffect } from 'react';
import { Card, Input, Switch, Button, message, Space } from 'antd';
import api from '../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    const { data } = await api.get('/settings');
    const map: Record<string, string> = {};
    data.forEach((s: any) => { map[s.key] = s.value; });
    setSettings(map);
  };

  useEffect(() => { fetchSettings(); }, []);

  const saveSetting = async (key: string, value: string) => {
    setLoading(true);
    try {
      await api.put(`/settings/${key}`, { value });
      message.success('Saqlandi');
      fetchSettings();
    } catch {
      message.error('Xatolik');
    }
    setLoading(false);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="SMS Sozlamalari">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>SMS yuborish:</strong>{' '}
            <Switch
              checked={settings.sms_enabled === 'true'}
              onChange={(v) => saveSetting('sms_enabled', v ? 'true' : 'false')}
            />
          </div>
          <div>
            <strong>SMS shablon:</strong>
            <Input.TextArea
              value={settings.sms_template || ''}
              onChange={e => setSettings({ ...settings, sms_template: e.target.value })}
              rows={3}
              style={{ marginTop: 8 }}
            />
            <Button type="primary" onClick={() => saveSetting('sms_template', settings.sms_template || '')} loading={loading} style={{ marginTop: 8 }}>
              Saqlash
            </Button>
          </div>
        </Space>
      </Card>

      <Card title="Monitoring">
        <div>
          <strong>Monitoring aktiv:</strong>{' '}
          <Switch
            checked={settings.monitoring_active === 'true'}
            onChange={(v) => saveSetting('monitoring_active', v ? 'true' : 'false')}
          />
        </div>
      </Card>
    </Space>
  );
}
