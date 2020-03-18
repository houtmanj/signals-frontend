import { wktPointToLocation } from './transformers';
import { pdok2address } from '../../../shared/services/map-location';

const GEOCODER_API_LOOKUP =
  'https://geodata.nationaalgeoregister.nl/locatieserver/v3/lookup?fq=gemeentenaam:(amsterdam OR weesp)&fq=type:adres&id=';

export const getAddressById = async addressId => {
  const result = await window.fetch(`${GEOCODER_API_LOOKUP}${addressId}`);
  const { response } = await result.json();
  if (response.docs[0]) {
    const { centroide_ll } = response.docs[0];
    const locationInfo = {
      location: wktPointToLocation(centroide_ll),
      address: { ...pdok2address(response.docs[0]) },
    };

    return locationInfo;
  }
  return null;
};