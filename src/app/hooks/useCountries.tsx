import countries from 'world-countries';

// Restrict to Indonesia only (cca2 === 'ID')
const indonesia = countries.find(c => c.cca2 === 'ID');
const formattedCountries = indonesia ? [{
    value: indonesia.cca2,
    label: indonesia.name.common,
    flag: indonesia.flag,
    latlng: indonesia.latlng,
    region: indonesia.region,
}] : [];

const useCountries = () => {
    const getAll = () => formattedCountries;

    const getByValue = (value: string) => formattedCountries.find((item) => item.value === value);

    return {
        getAll,
        getByValue
    }
};

export default useCountries;