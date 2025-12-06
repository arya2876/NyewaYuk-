// Static list of major Indonesian cities with approximate coordinates.
// Extend as needed. Coordinates are center points for filtering radius.
export interface IndonesianCity {
  value: string; // slug
  label: string; // display name
  region: string; // island/region grouping
  latlng: [number, number];
}

const cities: IndonesianCity[] = [
  { value: 'jakarta', label: 'Jakarta', region: 'Jawa', latlng: [-6.2000, 106.8166] },
  { value: 'surabaya', label: 'Surabaya', region: 'Jawa', latlng: [-7.2575, 112.7521] },
  { value: 'bandung', label: 'Bandung', region: 'Jawa', latlng: [-6.9175, 107.6191] },
  { value: 'semarang', label: 'Semarang', region: 'Jawa', latlng: [-6.9667, 110.4167] },
  { value: 'yogyakarta', label: 'Yogyakarta', region: 'Jawa', latlng: [-7.7956, 110.3695] },
  { value: 'medan', label: 'Medan', region: 'Sumatra', latlng: [3.5952, 98.6722] },
  { value: 'palembang', label: 'Palembang', region: 'Sumatra', latlng: [-2.9909, 104.7567] },
  { value: 'padang', label: 'Padang', region: 'Sumatra', latlng: [-0.9471, 100.4172] },
  { value: 'pekanbaru', label: 'Pekanbaru', region: 'Sumatra', latlng: [0.5333, 101.4500] },
  { value: 'batam', label: 'Batam', region: 'Sumatra', latlng: [1.0456, 104.0305] },
  { value: 'banda-aceh', label: 'Banda Aceh', region: 'Sumatra', latlng: [5.5540, 95.3222] },
  { value: 'denpasar', label: 'Denpasar (Bali)', region: 'Bali', latlng: [-8.6705, 115.2126] },
  { value: 'makassar', label: 'Makassar', region: 'Sulawesi', latlng: [-5.1477, 119.4327] },
  { value: 'manado', label: 'Manado', region: 'Sulawesi', latlng: [1.4748, 124.8421] },
  { value: 'samarinda', label: 'Samarinda', region: 'Kalimantan', latlng: [-0.5022, 117.1536] },
  { value: 'balikpapan', label: 'Balikpapan', region: 'Kalimantan', latlng: [-1.2379, 116.8529] },
  { value: 'pontianak', label: 'Pontianak', region: 'Kalimantan', latlng: [0.0222, 109.3333] },
  { value: 'banjarmasin', label: 'Banjarmasin', region: 'Kalimantan', latlng: [-3.3199, 114.5908] },
  { value: 'mataram', label: 'Mataram', region: 'Nusa Tenggara', latlng: [-8.5833, 116.1167] },
  { value: 'kupang', label: 'Kupang', region: 'Nusa Tenggara', latlng: [-10.1772, 123.6070] },
  { value: 'jayapura', label: 'Jayapura', region: 'Papua', latlng: [-2.5337, 140.7181] },
  { value: 'malang', label: 'Malang', region: 'Jawa', latlng: [-7.9839, 112.6214] },
  { value: 'bogor', label: 'Bogor', region: 'Jawa', latlng: [-6.5950, 106.8167] },
];

const useIndonesianCities = () => {
  const getAll = () => cities;
  const getByValue = (value: string) => cities.find(c => c.value === value);
  return { getAll, getByValue };
};

export default useIndonesianCities;