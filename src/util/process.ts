import { DataFormat } from '../types';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Fill, Stroke, Text, Circle as CircleStyle, Icon } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import GeometryType from 'ol/geom/GeometryType';
import Arrow from '../img/arrow.png';

export const processData = (buffer: DataFormat[]) => {
  buffer.reverse();

  const perID: { [key: string]: Array<{ coordinate: number[]; label: string }> } = {};

  buffer.map(item => {
    if (!perID[item.bus_id]) {
      perID[item.bus_id] = [{ coordinate: [item.longitude, item.latitude], label: item.num_passenger.toString() }];
    } else {
      perID[item.bus_id].push({ coordinate: [item.longitude, item.latitude], label: item.num_passenger.toString() });
    }
  });

  return perID;

  //   const pointFeatures: Feature[] = [];
  //   const linestring: number[][] = [];

  //   buffer.map(elem => {
  //     const feature = new Feature(new Point([elem.longitude, elem.latitude]).transform('EPSG:4326', 'EPSG:3857'));
  //     feature.set('passenger', elem.num_passenger.toString());
  //     pointFeatures.push(feature);
  //     linestring.push([elem.longitude, elem.latitude]);
  //   });

  //   const lineFeature = new Feature<LineString>(new LineString(linestring).transform('EPSG:4326', 'EPSG:3857'));

  //   pointFeatures.push(lineFeature);

  //   return new VectorLayer({
  //     source: new VectorSource({
  //       features: [...pointFeatures],
  //     }),
  //     style: function(feature: FeatureLike) {
  //       const geo_type = feature.getGeometry()?.getType();
  //       if (geo_type == GeometryType.LINE_STRING) {
  //         const geometry = feature.getGeometry() as LineString;

  //         const line_styles = [
  //           new Style({
  //             stroke: new Stroke({
  //               color: '#49A8DE',
  //               width: 2,
  //             }),
  //           }),
  //         ];

  //         geometry.forEachSegment(function(start, end) {
  //           const dx = end[0] - start[0];
  //           const dy = end[1] - start[1];
  //           const rotation = Math.atan2(dy, dx);

  //           line_styles.push(
  //             new Style({
  //               geometry: new Point(end),
  //               image: new Icon({
  //                 src: Arrow,
  //                 anchor: [0.75, 0.5],
  //                 rotateWithView: true,
  //                 rotation: -rotation,
  //               }),
  //             })
  //           );
  //         });
  //         return line_styles;
  //       }

  //       if (geo_type == GeometryType.POINT) {
  //         const label = feature.get('passenger');
  //         return new Style({
  //           text: new Text({
  //             stroke: new Stroke({
  //               color: '#b7b7b7',
  //               width: 1,
  //             }),
  //             font: '12px/1 sans-serif',
  //             text: label,
  //           }),
  //           image: new CircleStyle({
  //             radius: 9,
  //             fill: new Fill({
  //               color: 'rgba(255, 255, 255, 0.2)',
  //             }),
  //             stroke: new Stroke({
  //               color: 'rgba(73,168,222,0.5)',
  //               width: 2,
  //             }),
  //           }),
  //         });
  //       }
  //       return new Style();
  //     },
  //     zIndex: 2,
  //   });
};

export const drawFeature = (data: Array<{ coordinate: number[]; label: string }>) => {
  const totalFeatures: Feature[] = [];
  const linestring: number[][] = [];

  data.map(item => {
    const feature = new Feature(new Point(item.coordinate).transform('EPSG:4326', 'EPSG:3857'));
    feature.set('passenger', item.label.toString());
    totalFeatures.push(feature);
    linestring.push(item.coordinate);
  });

  const lineFeature = new Feature<LineString>(new LineString(linestring).transform('EPSG:4326', 'EPSG:3857'));

  totalFeatures.push(lineFeature);

  return new VectorLayer({
    source: new VectorSource({
      features: [...totalFeatures],
    }),
    style: function(feature: FeatureLike) {
      const geo_type = feature.getGeometry()?.getType();
      if (geo_type == GeometryType.LINE_STRING) {
        const geometry = feature.getGeometry() as LineString;

        const line_styles = [
          new Style({
            stroke: new Stroke({
              color: '#49A8DE',
              width: 2,
            }),
          }),
        ];

        geometry.forEachSegment(function(start, end) {
          const dx = end[0] - start[0];
          const dy = end[1] - start[1];
          const rotation = Math.atan2(dy, dx);

          line_styles.push(
            new Style({
              geometry: new Point(end),
              image: new Icon({
                src: Arrow,
                anchor: [0.75, 0.5],
                rotateWithView: true,
                rotation: -rotation,
              }),
            })
          );
        });
        return line_styles;
      }

      if (geo_type == GeometryType.POINT) {
        const label = feature.get('passenger');
        return new Style({
          text: new Text({
            stroke: new Stroke({
              color: '#b7b7b7',
              width: 1,
            }),
            font: '12px/1 sans-serif',
            text: label,
          }),
          image: new CircleStyle({
            radius: 9,
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new Stroke({
              color: 'rgba(73,168,222,0.5)',
              width: 2,
            }),
          }),
        });
      }
      return new Style();
    },
    zIndex: 2,
  });
};
