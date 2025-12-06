"use client";

import Select from 'react-select';
import useIndonesianAdministrative from '@/app/hooks/useIndonesianAdministrative';

export interface SubdistrictValue { value: string; label: string }

export default function SubdistrictSelect({ province, city, district, value, onChange, placeholder = 'Pilih kelurahan' }: {
  province?: string;
  city?: string;
  district?: string;
  value?: SubdistrictValue | null;
  onChange: (value: SubdistrictValue | null) => void;
  placeholder?: string;
}) {
  const { getKelurahan } = useIndonesianAdministrative();
  const options = getKelurahan(province, city, district).map(k => ({ value: k.value, label: k.label }));
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
