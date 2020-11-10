import React, { PureComponent } from 'react';
import { PanelProps /* , Vector as VectorData */ } from '@grafana/data';
import { PanelOptions, Buffer } from 'types';
import { Map, View } from 'ol';
import XYZ from 'ol/source/XYZ';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { defaults, DragPan, MouseWheelZoom } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import { nanoid } from 'nanoid';
import { processData, drawFeature } from './util/process';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import 'ol/ol.css';
import './css/main.css';

interface Props extends PanelProps<PanelOptions> {}
interface State {
  options: string[];
  current: string;
}

export class MainPanel extends PureComponent<Props, State> {
  id = 'id' + nanoid();
  map: Map;
  randomTile: TileLayer;
  infoLayer: VectorLayer;
  perID: { [key: string]: Array<{ coordinate: number[]; label: string }> };

  state = {
    options: [],
    current: 'None',
  };

  componentDidMount() {
    const { tile_url, zoom_level, center_lon, center_lat } = this.props.options;

    const carto = new TileLayer({
      source: new XYZ({
        url: 'https://{1-4}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      }),
    });

    let clon = center_lon,
      clat = center_lat;

    if (this.props.data.series.length > 0) {
      const { buffer } = this.props.data.series[0].fields[0].values as Buffer;
      clon = buffer[0].longitude;
      clat = buffer[0].latitude;
    }

    this.map = new Map({
      interactions: defaults({ dragPan: false, mouseWheelZoom: false, onFocusOnly: true }).extend([
        new DragPan({
          condition: function(event) {
            return platformModifierKeyOnly(event) || this.getPointerCount() === 2;
          },
        }),
        new MouseWheelZoom({
          condition: platformModifierKeyOnly,
        }),
      ]),
      layers: [carto],
      view: new View({
        center: fromLonLat([clon, clat]),
        zoom: zoom_level,
      }),
      target: this.id,
    });

    if (tile_url !== '') {
      this.randomTile = new TileLayer({
        source: new XYZ({
          url: tile_url,
        }),
        zIndex: 1,
      });
      this.map.addLayer(this.randomTile);
    }

    if (this.props.data.series.length > 0) {
      const { buffer } = this.props.data.series[0].fields[0].values as Buffer;

      this.perID = processData(buffer);
      this.setState({ options: ['None', ...Object.keys(this.perID)] });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.data.series !== this.props.data.series) {
      this.map.removeLayer(this.infoLayer);
      if (this.props.data.series.length == 0) {
        this.setState({ options: [], current: 'None' });
        return;
      }

      const { buffer } = this.props.data.series[0].fields[0].values as Buffer;

      if (prevProps.data.series.length == 0) {
        this.map.getView().animate({
          center: fromLonLat([buffer[0].longitude, buffer[0].latitude]),
          duration: 2000,
        });
      }

      this.perID = processData(buffer);
      this.setState({ options: ['None', ...Object.keys(this.perID)], current: 'None' });
    }

    if (prevProps.options.tile_url !== this.props.options.tile_url) {
      if (this.randomTile) {
        this.map.removeLayer(this.randomTile);
      }
      if (this.props.options.tile_url !== '') {
        this.randomTile = new TileLayer({
          source: new XYZ({
            url: this.props.options.tile_url,
          }),
          zIndex: 1,
        });
        this.map.addLayer(this.randomTile);
      }
    }

    if (prevProps.options.zoom_level !== this.props.options.zoom_level) {
      this.map.getView().setZoom(this.props.options.zoom_level);
    }

    if (
      prevProps.options.center_lat !== this.props.options.center_lat ||
      prevProps.options.center_lon !== this.props.options.center_lon
    ) {
      this.map.getView().animate({
        center: fromLonLat([this.props.options.center_lon, this.props.options.center_lat]),
        duration: 2000,
      });
    }

    if (prevState.current !== this.state.current) {
      this.map.removeLayer(this.infoLayer);
      if (this.state.current == 'None') return;

      const busLine = this.perID[this.state.current];
      const middlePoint = busLine[Math.floor(busLine.length / 2)];

      this.map.getView().animate({
        center: fromLonLat(middlePoint.coordinate),
        duration: 2000,
      });

      this.infoLayer = drawFeature(this.perID[this.state.current]);
      this.map.addLayer(this.infoLayer);
    }
  }

  onSelect = (option: { value: string; label: React.ReactNode }) => {
    this.setState({ current: option.value });
  };

  render() {
    const { width, height } = this.props;
    const { options, current } = this.state;

    return (
      <div style={{ width, height }}>
        <Dropdown className="custom-dropdown" options={options} onChange={this.onSelect} value={current} />
        <div id={this.id} style={{ width, height: height - 40 }}></div>;
      </div>
    );
  }
}
