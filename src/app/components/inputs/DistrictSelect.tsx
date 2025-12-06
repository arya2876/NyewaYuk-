"use client";

import Select from 'react-select';
import useIndonesianAdministrative from '@/app/hooks/useIndonesianAdministrative';

export interface DistrictValue { value: string; label: string }

export default function DistrictSelect({ province, city, value, onChange, placeholder = 'Pilih kecamatan' }: {
  province?: string;
  city?: string;
  value?: DistrictValue | null;
  onChange: (value: DistrictValue | null) => void;
  placeholder?: string;
}) {
  const { getKecamatan } = useIndonesianAdministrative();
  const options = getKecamatan(province, city).map(k => ({ value: k.value, label: k.label }));
  return (
    <Select
      placeholder={placeholder}
      isClearable
      options={options}
      value={value as any}
      onChange={(val) => onChange(val as any)}
      classNames={{ control: () => 'p-1 border-2 text-sm', input: () => 'text-sm', option: () => 'text-sm' }}
      theme={(theme) => ({ ...theme, borderRadius: 6, colors: { ...theme.colors, primary: '#0f172a', primary25: '#f1f5f9' } })}
    />
  );
}
