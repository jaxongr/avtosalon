import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createCallback } from '../api';
import styles from './CallbackPage.module.css';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const carId = searchParams.get('carId') || undefined;
  const navigate = useNavigate();

  const [phone, setPhone] = useState('+998');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\+998\d{9}$/.test(phone)) {
      setError('Telefon raqamni to\'g\'ri kiriting: +998XXXXXXXXX');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createCallback({ phone, name: name || undefined, carId, message: message || undefined });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>&#10003;</div>
          <h2>So'rov yuborildi!</h2>
          <p>Menejerimiz tez orada siz bilan bog'lanadi</p>
          <button className={styles.btn} onClick={() => navigate('/')}>Katalogga qaytish</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Orqaga</button>

      <div className={styles.formCard}>
        <h2 className={styles.title}>Menejer chaqirish</h2>
        <p className={styles.subtitle}>Ma'lumotlaringizni qoldiring, biz siz bilan bog'lanamiz</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Telefon raqam *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998901234567"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>Ismingiz</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ali"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>Xabar</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </form>
      </div>
    </div>
  );
}
