// Minimal Indonesian administrative mapping: Provinces -> Cities/Kabupaten -> Kecamatan -> Kelurahan
// Extend as needed. This provides cascading dropdown options.

export interface KelurahanOption { value: string; label: string }
export interface KecamatanOption { value: string; label: string; kelurahan?: KelurahanOption[] }
export interface CityOption { value: string; label: string; kecamatan?: KecamatanOption[] }
export interface ProvinceOption { value: string; label: string; cities?: CityOption[] }

const data: ProvinceOption[] = [
  {
    value: 'dki-jakarta',
    label: 'DKI Jakarta',
    cities: [
      {
        value: 'jakarta-selatan',
        label: 'Jakarta Selatan',
        kecamatan: [
          { value: 'kebayoran-baru', label: 'Kebayoran Baru', kelurahan: [
            { value: 'senayan', label: 'Senayan' },
            { value: 'gunung', label: 'Gunung' },
            { value: 'cipete-utara', label: 'Cipete Utara' },
          ]},
          { value: 'tebet', label: 'Tebet', kelurahan: [
            { value: 'tebet-barat', label: 'Tebet Barat' },
            { value: 'tebet-timur', label: 'Tebet Timur' },
          ]},
          { value: 'mampang-prapatan', label: 'Mampang Prapatan', kelurahan: [
            { value: 'bangka', label: 'Bangka' },
            { value: 'pela-mampang', label: 'Pela Mampang' },
          ]},
        ],
      },
      {
        value: 'jakarta-pusat',
        label: 'Jakarta Pusat',
        kecamatan: [
          { value: 'menteng', label: 'Menteng', kelurahan: [
            { value: 'menteng', label: 'Menteng' },
            { value: 'pekojan', label: 'Pekojan' },
          ]},
          { value: 'tanah-abang', label: 'Tanah Abang', kelurahan: [
            { value: 'bendungan-hilir', label: 'Bendungan Hilir' },
            { value: 'karet-tengsin', label: 'Karet Tengsin' },
          ]},
        ],
      }
    ],
  },
  {
    value: 'jawa-tengah',
    label: 'Jawa Tengah',
    cities: [
      {
        value: 'kota-semarang',
        label: 'Kota Semarang',
        kecamatan: [
          { value: 'tembalang', label: 'Tembalang', kelurahan: [
            { value: 'bulusan', label: 'Bulusan' },
            { value: 'meteseh', label: 'Meteseh' },
          ]},
          { value: 'semarang-timur', label: 'Semarang Timur', kelurahan: [
            { value: 'bugangan', label: 'Bugangan' },
            { value: 'sarang', label: 'Sarang' },
          ]},
          { value: 'semarang-barat', label: 'Semarang Barat', kelurahan: [
            { value: 'kalibanteng-kidul', label: 'Kalibanteng Kidul' },
            { value: 'krobokan', label: 'Krobokan' },
          ]},
        ],
      },
    ],
  },
];

const useIndonesianAdministrative = () => {
  const getProvinces = (): ProvinceOption[] => data;
  const getProvinceByValue = (val: string): ProvinceOption | undefined => data.find(p => p.value === val);
  const getCities = (provinceVal?: string): CityOption[] => {
    const p = provinceVal ? getProvinceByValue(provinceVal) : undefined;
    return p?.cities || [];
  };
  const getCityByValue = (provinceVal: string | undefined, cityVal: string): CityOption | undefined => {
    const list = getCities(provinceVal);
    return list.find(c => c.value === cityVal);
  };
  const getKecamatan = (provinceVal?: string, cityVal?: string): KecamatanOption[] => {
    const c = cityVal ? getCityByValue(provinceVal, cityVal) : undefined;
    return c?.kecamatan || [];
  };
  const getKelurahan = (provinceVal?: string, cityVal?: string, kecVal?: string): KelurahanOption[] => {
    const ks = getKecamatan(provinceVal, cityVal);
    const k = kecVal ? ks.find(k => k.value === kecVal) : undefined;
    return k?.kelurahan || [];
  };
  return { getProvinces, getProvinceByValue, getCities, getCityByValue, getKecamatan, getKelurahan };
};

export default useIndonesianAdministrative;
