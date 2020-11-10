import { DataFormat } from '../types';
import Feature from 'ol/Feature';
import Circle from 'ol/geom/Circle';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';

export const processData = (buffer: DataFormat[]) => {
  const pointFeatures = buffer.map(elem => {
    const feature = new Feature(new Circle(fromLonLat([elem.longitude, elem.latitude]), 3));
    feature.set('passenger', elem.num_passenger.toString());
    return feature;
  });

  return new VectorLayer({
    source: new VectorSource({
      features: pointFeatures,
    }),
    style: function(feature: FeatureLike) {
      const label = feature.get('passenger');
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#49A8DE',
          width: 2,
        }),
        text: new Text({
          stroke: new Stroke({
            color: '#b7b7b7',
            width: 1,
          }),
          font: '10px/1 sans-serif',
          text: label,
        }),
      });
    },
    zIndex: 2,
  });
};
