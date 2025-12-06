'use client';

import Select from 'react-select';
import useIndonesianCities from '@/app/hooks/useIndonesianCities';

export interface CitySelectValue {
  value: string;
  label: string;
  region: string;
  latlng: [number, number];
}

interface CitySelectProps {
  value?: CitySelectValue;
  onChange: (value: CitySelectValue) => void;
  placeholder?: string;
}

const CitySelect: React.FC<CitySelectProps> = ({ value, onChange, placeholder = 'Pilih kota' }) => {
  const { getAll } = useIndonesianCities();
  const options = getAll();

  return (
    <Select
      placeholder={placeholder}
      isClearable
      options={options}
      value={value}
      onChange={(val) => onChange(val as CitySelectValue)}
      formatOptionLabel={(opt: any) => (
        <div className="flex items-center gap-2">
          <span className="text-xs px-1 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-mono">{(opt?.value || '').toString().toUpperCase()}</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{opt?.label ?? ''}</span>
            <span className="text-[11px] text-neutral-500">{opt?.region ?? ''}</span>
          </div>
        </div>
      )}
      classNames={{
        control: () => 'p-1 border-2 text-sm',
        input: () => 'text-sm',
        option: () => 'text-sm'
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 6,
        colors: { ...theme.colors, primary: '#0f172a', primary25: '#f1f5f9' }
      })}
    />
  );
};

export default CitySelect;