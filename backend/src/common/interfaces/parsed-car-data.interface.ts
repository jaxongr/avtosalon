export interface ParsedCarData {
  brand: string | null;
  model: string | null;
  year: number | null;
  priceAmount: number | null;
  priceCurrency: 'USD' | 'UZS' | null;
  color: string | null;
  mileage: string | null;
  fuelType: string | null;
  transmission: string | null;
  condition: string | null;
  creditAvailable: boolean | null;
  city: string | null;
}
