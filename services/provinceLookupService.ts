import type { FeatureCollection } from './provinceLookupTypes';

import { provinceMatches } from '../utils/provinceNormalize';

export type LonLat = [number, number];

let cachedChinaGeoJson: FeatureCollection | null = null;

export async function loadChinaGeoJson(): Promise<FeatureCollection> {
  if (cachedChinaGeoJson) return cachedChinaGeoJson;
  const res = await fetch('/maps/china.json');
  if (!res.ok) {
    throw new Error(`Failed to load china.json: ${res.statusText}`);
  }
  const json = (await res.json()) as FeatureCollection;
  cachedChinaGeoJson = json;
  return json;
}

export function inferProvinceFromGeoJson(params: {
  lat: number;
  lon: number;
  geoJson: FeatureCollection;
}): string | null {
  const point: LonLat = [params.lon, params.lat];

  for (const feature of params.geoJson.features) {
    const name = feature.properties?.name;
    const geom = feature.geometry;
    if (typeof name !== 'string' || !geom) continue;

    if (geom.type === 'Polygon') {
      if (pointInPolygonWithHoles(point, geom.coordinates)) return name;
    } else if (geom.type === 'MultiPolygon') {
      if (pointInMultiPolygon(point, geom.coordinates)) return name;
    }
  }

  return null;
}

export async function inferProvince(lat: number, lon: number): Promise<string | null> {
  const geoJson = await loadChinaGeoJson();
  return inferProvinceFromGeoJson({ lat, lon, geoJson });
}

export function provinceNameFromGeoJsonFeatureName(name: string): string {
  // Return raw GeoJSON name (e.g. "北京市"), but keep a single place to centralize the contract.
  return name;
}

export function findProvinceFeatureByName(params: {
  geoJson: FeatureCollection;
  provinceName: string;
}): { name: string; geometryType: 'Polygon' | 'MultiPolygon' } | null {
  for (const feature of params.geoJson.features) {
    const name = feature.properties?.name;
    const geom = feature.geometry;
    if (typeof name !== 'string' || !geom) continue;
    if (!provinceMatches(name, params.provinceName)) continue;

    if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      return { name, geometryType: geom.type };
    }
  }
  return null;
}

// ========== geometry helpers (no new dependencies) ==========

type Ring = LonLat[];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

function pointInMultiPolygon(point: LonLat, multi: MultiPolygon): boolean {
  for (const poly of multi) {
    if (pointInPolygonWithHoles(point, poly)) return true;
  }
  return false;
}

function pointInPolygonWithHoles(point: LonLat, polygon: Polygon): boolean {
  if (!polygon.length) return false;
  if (!pointInRing(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false;
  }
  return true;
}

function pointInRing(point: LonLat, ring: Ring): boolean {
  // Ray casting algorithm; treat boundary as inside.
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    if (pointOnSegment([x, y], [xi, yi], [xj, yj])) return true;

    const intersect = ((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function pointOnSegment(p: LonLat, a: LonLat, b: LonLat): boolean {
  const px = p[0];
  const py = p[1];
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];

  const lenSq = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (lenSq === 0) {
    return Math.abs(px - ax) < 1e-10 && Math.abs(py - ay) < 1e-10;
  }

  const cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  if (Math.abs(cross) > 1e-10) return false;

  const dot = (px - ax) * (bx - ax) + (py - ay) * (by - ay);
  if (dot < 0) return false;
  if (dot > lenSq) return false;

  return true;
}
