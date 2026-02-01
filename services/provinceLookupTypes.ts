export type LonLat = [number, number];

export type GeoJsonGeometry =
  | {
      type: 'Polygon';
      // coordinates: [ [ [lon,lat], ... ] outerRing, ...holes ]
      coordinates: LonLat[][];
    }
  | {
      type: 'MultiPolygon';
      // coordinates: [ polygon, polygon, ... ]
      coordinates: LonLat[][][];
    };

export interface GeoJsonFeature {
  type: 'Feature';
  properties?: {
    name?: string;
    [k: string]: unknown;
  };
  geometry: GeoJsonGeometry;
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}
