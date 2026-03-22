import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars } from '../api';
import styles from './CatalogPage.module.css';

const CATEGORIES = [
  { key: '', label: 'Barchasi' },
  { key: 'SEDAN', label: 'Sedan' },
  { key: 'SUV', label: 'SUV' },
  { key: 'MINIVAN', label: 'Minivan' },
  { key: 'HATCHBACK', label: 'Xetchbek' },
  { key: 'COUPE', label: 'Kupe' },
  { key: 'TRUCK', label: 'Yuk' },
];

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  category: string;
  photos: string[];
  mileage?: number;
  engine?: string;
}

export default function CatalogPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getCars({ category: category || undefined, limit: 50 })
      .then(res => setCars(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Avtosalon</h1>
        <p className={styles.subtitle}>Eng yaxshi narxlarda mashinalar</p>
      </header>

      <div className={styles.categories}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`${styles.categoryBtn} ${category === c.key ? styles.active : ''}`}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Yuklanmoqda...</div>
      ) : cars.length === 0 ? (
        <div className={styles.empty}>Mashinalar topilmadi</div>
      ) : (
        <div className={styles.grid}>
          {cars.map(car => (
            <div key={car.id} className={styles.card} onClick={() => navigate(`/car/${car.id}`)}>
              <div className={styles.cardImage}>
                {car.photos?.[0] ? (
                  <img src={car.photos[0]} alt={`${car.brand} ${car.model}`} />
                ) : (
                  <div className={styles.noImage}>No Photo</div>
                )}
                <span className={styles.badge}>{car.category}</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.carName}>{car.brand} {car.model}</h3>
                <div className={styles.carInfo}>
                  <span>{car.year} yil</span>
                  {car.mileage && <span>{car.mileage.toLocaleString()} km</span>}
                  {car.engine && <span>{car.engine}</span>}
                </div>
                <div className={styles.price}>${Number(car.price).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className={styles.fab} onClick={() => navigate('/callback')}>
        Menejer chaqirish
      </button>
    </div>
  );
}
