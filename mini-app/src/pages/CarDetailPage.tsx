import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCar } from '../api';
import styles from './CarDetailPage.module.css';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  category: string;
  color?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  description?: string;
  photos: string[];
  videos: string[];
}

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getCar(id)
      .then(res => setCar(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>Yuklanmoqda...</div>;
  if (!car) return <div className={styles.loading}>Mashina topilmadi</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Orqaga</button>

      <div className={styles.gallery}>
        {car.photos?.length > 0 ? (
          <>
            <img src={car.photos[currentPhoto]} alt="" className={styles.mainImage} />
            {car.photos.length > 1 && (
              <div className={styles.thumbs}>
                {car.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    className={`${styles.thumb} ${i === currentPhoto ? styles.activeThumb : ''}`}
                    onClick={() => setCurrentPhoto(i)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.noPhoto}>Rasm yo'q</div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h1 className={styles.name}>{car.brand} {car.model}</h1>
          <span className={styles.year}>{car.year}</span>
        </div>

        <div className={styles.price}>${Number(car.price).toLocaleString()}</div>

        <div className={styles.specs}>
          {car.category && <div className={styles.spec}><span>Turi</span><strong>{car.category}</strong></div>}
          {car.color && <div className={styles.spec}><span>Rang</span><strong>{car.color}</strong></div>}
          {car.mileage != null && <div className={styles.spec}><span>Yurgan</span><strong>{car.mileage.toLocaleString()} km</strong></div>}
          {car.engine && <div className={styles.spec}><span>Dvigatel</span><strong>{car.engine}</strong></div>}
          {car.transmission && <div className={styles.spec}><span>KPP</span><strong>{car.transmission}</strong></div>}
        </div>

        {car.description && (
          <div className={styles.description}>
            <h3>Tavsif</h3>
            <p>{car.description}</p>
          </div>
        )}

        {car.videos?.length > 0 && (
          <div className={styles.videos}>
            <h3>Video</h3>
            {car.videos.map((v, i) => (
              <video key={i} src={v} controls className={styles.video} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <a href="tel:+998901234567" className={styles.callBtn}>Qo'ng'iroq qilish</a>
        <button className={styles.requestBtn} onClick={() => navigate(`/callback?carId=${car.id}`)}>
          Menejer chaqirish
        </button>
      </div>
    </div>
  );
}
