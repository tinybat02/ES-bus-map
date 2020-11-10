import { DataFrame, Field, Vector } from '@grafana/data';

export interface PanelOptions {
  center_lat: number;
  center_lon: number;
  tile_url: string;
  zoom_level: number;
}

export const defaults: PanelOptions = {
  center_lat: 37.9908,
  center_lon: 23.6682,
  tile_url: '',
  zoom_level: 16,
};

export interface DataFormat {
  bus_id: string;
  latitude: number;
  longitude: number;
  num_passenger: number;
  speed: number;
  timestamp: number;
}

export interface Buffer extends Vector {
  buffer: Array<DataFormat>;
}

export interface FieldBuffer extends Field<any, Vector> {
  values: Buffer;
}

export interface Frame extends DataFrame {
  fields: FieldBuffer[];
}
