proj4geojson
============

`npm install proj4geojson`

```javascript
var transform = require('proj4geojson');
var sr = '+proj=lcc +lat_1=42.68333333333333 +lat_2=41.71666666666667 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs';
var wgs84geojson = transform.to(weirdProjgeojson,sr);
//or
var weirdProjgeojson = transform.from(wgs84geojson,sr);
```