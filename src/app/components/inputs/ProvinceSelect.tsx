"use client";

import Select from 'react-select';
import useIndonesianAdministrative from '@/app/hooks/useIndonesianAdministrative';

export interface ProvinceValue { value: string; label: string }

export default function ProvinceSelect({ value, onChange, placeholder = 'Pilih provinsi' }: {
  value?: ProvinceValue | null;
  onChange: (value: ProvinceValue | null) => void;
  placeholder?: string;
}) {
  const { getProvinces } = useIndonesianAdministrative();
  const options = getProvinces().map(p => ({ value: p.value, label: p.label }));
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
