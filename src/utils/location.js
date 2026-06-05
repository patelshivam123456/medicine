export const LOCATION_STORAGE_KEY = 'delivery_location_label';
export const LOCATION_CHANGE_EVENT = 'medicare-location-change';

export const readStoredLocationLabel = () => localStorage.getItem(LOCATION_STORAGE_KEY) || 'Current location';

export const saveLocationLabel = (label) => {
  localStorage.setItem(LOCATION_STORAGE_KEY, label);
  window.dispatchEvent(new CustomEvent(LOCATION_CHANGE_EVENT, { detail: label }));
};

export const clearStoredLocationLabel = () => {
  localStorage.removeItem(LOCATION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(LOCATION_CHANGE_EVENT, { detail: 'Current location' }));
};

export const buildAreaLabel = (locationData) => {
  const locality = locationData.locality || locationData.city || locationData.principalSubdivision || '';
  const area = locationData.localityInfo?.administrative?.find(item => item.adminLevel >= 8)?.name || locality;
  const city = locationData.city || locationData.locality || '';
  const state = locationData.principalSubdivision || '';

  return [area, city, state]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(', ');
};

export const reverseGeocode = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );

  if (!response.ok) {
    throw new Error('Unable to fetch address for current location');
  }

  return response.json();
};
