import axios from 'axios';

export interface GeoLocation {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export async function getGeoLocation(ipAddress: string): Promise<GeoLocation> {
  try {
    // Skip for localhost/private IPs
    if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.')) {
      return {
        country: 'Local',
        city: 'Local',
        region: 'Local'
      };
    }

    // You can use various IP geolocation APIs like:
    // - ipapi.co (free tier available)
    // - ip-api.com (free for non-commercial)
    // - ipgeolocation.io
    // - MaxMind GeoIP2

    // Example using ip-api.com (free tier)
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
      timeout: 3000
    });

    if (response.data.status === 'success') {
      return {
        country: response.data.country,
        city: response.data.city,
        region: response.data.regionName,
        latitude: response.data.lat,
        longitude: response.data.lon
      };
    }

    return {};
  } catch (error) {
    console.error('Geolocation error:', error);
    return {};
  }
}