import Component from '@glimmer/component';
import mapboxgl from 'mapbox-gl';
import {action} from '@ember/object';

export default class MainMapComponent extends Component {
  @action
  initMap() {
    const features = this.args.locations.map(function (location) {
      return {
        type: 'Feature',
        properties: {
          description: location.address,
        },
        geometry: {
          type: 'Point',
          coordinates: [
            Number(location.longitude),
            Number(location.latitude),
          ],
        },
      };
    });

    mapboxgl.accessToken =
      'pk.eyJ1Ijoid2FuZ2tla2VrZXhpbGkiLCJhIjoiWWkyTHR3cyJ9.qoV5P1kgtyq3PFDHioqrsg';
    const map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [121.4747, 31.25516],
      zoom: 12,
    });
    map.on('load', function () {
      map.loadImage('/assets/virus.png', function (_, image) {
        map.addImage('virus', image);
        map.addSource('places', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features,
          },
        });
        // Add a layer showing the places.
        map.addLayer({
          id: 'places',
          type: 'symbol',
          source: 'places',
          layout: {
            'icon-image': 'virus',
            'icon-allow-overlap': true,
          },
        });

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'places', function (e) {
          var coordinates = e.features[0].geometry.coordinates.slice();
          var description = e.features[0].properties.description;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'places', function () {
          map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'places', function () {
          map.getCanvas().style.cursor = '';
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            const latitude  = position.coords.latitude;
            const longitude = position.coords.longitude;
            map.setCenter([longitude, latitude]);
          });
        }
      });
    });
  }
}
