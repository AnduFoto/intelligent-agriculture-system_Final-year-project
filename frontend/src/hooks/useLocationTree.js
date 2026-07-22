import { useState, useEffect } from 'react';
import { locationService } from '../api/authService';

/**
 * Fetches the full Region -> Zone/SpecialWoreda -> Woreda tree once,
 * and exposes helpers to look up children given a selected parent —
 * powering cascading location dropdowns without per-level API calls.
 */
export function useLocationTree() {
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    locationService
      .getFullTree()
      .then((response) => {
        if (isMounted) setRegions(response.data);
      })
      .catch(() => {
        if (isMounted) setError('Could not load location data. Please refresh the page.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getZonesForRegion = (regionId) => {
    const region = regions.find((r) => r.id === Number(regionId));
    return region?.zones ?? [];
  };

  const getSpecialWoredasForRegion = (regionId) => {
    const region = regions.find((r) => r.id === Number(regionId));
    return region?.special_woredas ?? [];
  };

  const getWoredasForZone = (regionId, zoneId) => {
    const zones = getZonesForRegion(regionId);
    const zone = zones.find((z) => z.id === Number(zoneId));
    return zone?.woredas ?? [];
  };

  return {
    regions,
    isLoading,
    error,
    getZonesForRegion,
    getSpecialWoredasForRegion,
    getWoredasForZone,
  };
}