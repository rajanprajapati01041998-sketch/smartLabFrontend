import { buildAddressText } from '../src/utils/addressUtils';

describe('buildAddressText', () => {
  it('creates a readable address from the selected location details', () => {
    const address = buildAddressText({
      pincode: '400001',
      city: { cityName: 'Mumbai' },
      district: { districtName: 'Mumbai' },
      state: { stateName: 'Maharashtra' },
      country: 'India',
    });

    expect(address).toBe('Mumbai, Mumbai, Maharashtra, India, 400001');
  });

  it('ignores empty values and keeps the formatting clean', () => {
    const address = buildAddressText({
      city: { cityName: 'Pune' },
      state: { stateName: 'Maharashtra' },
    });

    expect(address).toBe('Pune, Maharashtra');
  });
});
