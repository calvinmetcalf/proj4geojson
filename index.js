'use strict';
var proj4 = require('proj4');


function TransformGeojson(func){
    this.func = func;
}
TransformGeojson.prototype.point = function(coord){
        return this.func(coord);
    };
TransformGeojson.prototype.line = function(line){
    return line.map(this.point, this);
};
TransformGeojson.prototype.multiLine = function(lnGroup){
    return lnGroup.map(this.line, this);
};
TransformGeojson.prototype.multiPoly = function(multPoly){
    return multPoly.map(this.multiLine, this);
};
TransformGeojson.prototype.geometries = function(geometries){
    return geometries.map(this.geometry, this);
};
TransformGeojson.prototype.bbox=function(bbox){
    return this.point(bbox.slice(0, 2)).concat(this.point(bbox.slice(2)));
};
TransformGeojson.prototype.geometry = function(geometry){
    var out = {};
    for(var key in geometry){
        if(key === 'bbox'){
            out.bbox = this.bbox(geometry.bbox);
        } else if (key !== 'coordinates' && key !== 'geometries') {
            out[key] = geometry[key];
        }
    }
    switch(geometry.type){
        case "Point":
            out.coordinates = this.point(geometry.coordinates);
            return out;
        case "LineString":
            out.coordinates = this.line(geometry.coordinates);
            return out;
        case "MultiPoint":
            out.coordinates = this.line(geometry.coordinates);
            return out;
        case "MultiLineString":
            out.coordinates = this.multiLine(geometry.coordinates);
            return out;
        case "Polygon":
            out.coordinates = this.multiLine(geometry.coordinates);
            return out;
        case "MultiPolygon":
            out.coordinates = this.multiPoly(geometry.coordinates);
            return out;
        case "GeometryCollection":
            out.geometries = this.geometries(geometry.geometries);
            return out;
    }
};
TransformGeojson.prototype.feature = function(feature){
    var out = {};
    for(var key in feature){
        if (key !== 'geometry') {
            out[key] = feature[key];
        }
    }
    out.geometry = this.geometry(feature.geometry);
    return out;
};
TransformGeojson.prototype.featureCollection = function(fc){
    var out = {};
    for(var key in fc){
        if(key === 'bbox'){
            out.bbox = this.bbox(fc.bbox);
        } else if(key !== 'features'){
            out[key] = fc[key];
        }
    }
    out.features = fc.features.map(this.feature, this);
    return out;
};

function toWGS84(geojson, srs){
    var trans = proj4(srs);
    var tFunc = new TransformGeojson(function(c){
        return trans.inverse(c);
    });
    return tFunc.featureCollection(geojson);
}
function fromWGS84(geojson, srs){
    var trans = proj4(srs);
    var tFunc = new TransformGeojson(function(c){
        return trans.forward(c);
    });
    return tFunc.featureCollection(geojson);
}
module.exports = exports = TransformGeojson;
exports.to = exports.toWGS84 = toWGS84;
exports.from = exports.fromWGS84 = fromWGS84;
