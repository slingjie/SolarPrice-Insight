import { describe, expect, it } from 'vitest';

import fs from 'node:fs';

import type { FeatureCollection } from './provinceLookupTypes';

import { findProvinceFeatureByName, inferProvinceFromGeoJson } from './provinceLookupService';

function loadGeo(): FeatureCollection {
  const raw = fs.readFileSync('public/maps/china.json', 'utf8');
  return JSON.parse(raw) as FeatureCollection;
}

describe('provinceLookupService', () => {
  it('infers Beijing from coordinates', () => {
    const geo = loadGeo();
    const result = inferProvinceFromGeoJson({ lat: 39.9042, lon: 116.4074, geoJson: geo });
    expect(result).toBe('北京市');
  });

  it('infers Shanghai from coordinates', () => {
    const geo = loadGeo();
    const result = inferProvinceFromGeoJson({ lat: 31.2304, lon: 121.4737, geoJson: geo });
    expect(result).toBe('上海市');
  });

  it('infers Guangdong (Guangzhou) from coordinates', () => {
    const geo = loadGeo();
    const result = inferProvinceFromGeoJson({ lat: 23.1291, lon: 113.2644, geoJson: geo });
    expect(result).toBe('广东省');
  });

  it('handles MultiPolygon geometry branch', () => {
    const geo = loadGeo();
    const beijing = findProvinceFeatureByName({ geoJson: geo, provinceName: '北京市' });
    expect(beijing).not.toBeNull();
    expect(beijing!.geometryType).toBe('MultiPolygon');
  });
});
