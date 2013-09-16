var proj4 = require('proj4js');


function transformGeojson(func){
    var self = this;
    self.func = func;
    this.point = function(coord){
        return self.func(coord);
    };
    this.line = function(line){
        return line.map(self.point);
    };
    this.multiLine = function(lnGroup){
        return lnGroup.map(self.line);
    };
    this.multiPoly = function(multPoly){
        return multPoly.map(self.multiLine);
    };
    this.geometries = function(geometries){
        return geometries.map(self.geometry);
    };
    this.bbox=function(bbox){
        return self.point(bbox.slice(0,2)).concat(self.point(bbox.slice(2)));
    }
    this.geometry = function(geometry){
        var out = {};
        for(var key in geometry){
            if(key === 'bbox'){
                out.bbox = self.bbox(geometry.bbox);
            }else if(key !== 'coordinates' && key !== 'geometries'){
                out[key]=geometry[key];
            }
        }
        switch(geometry.type){
            case "Point":
                out.coordinates = self.point(geometry.coordinates);
                return out;
            case "LineString":
                out.coordinates = self.line(geometry.coordinates);
                return out;
            case "MultiPoint":
                out.coordinates = self.line(geometry.coordinates);
                return out;
            case "MultiLineString":
                out.coordinates = self.multiLine(geometry.coordinates);
                return out;
            case "Polygon":
                out.coordinates = self.multiLine(geometry.coordinates);
                return out;
            case "MultiPolygon":
                out.coordinates = self.multiPoly(geometry.coordinates);
                return out;
            case "GeometryCollection":
                out.geometries = self.geometries(geometry.geometries);
                return out;
        }
    };
    this.feature = function(feature){
        var out = {};
        for(var key in feature){
            if(key !== 'geometry'){
                out[key]=feature[key];
            }
        }
        out.geometry = self.geometry(feature.geometry);
        return out;
    };
    this.featureCollection = function(fc){
        var out = {};
        for(var key in fc){
            if(key === 'bbox'){
                out.bbox = self.bbox(fc.bbox);
            }else if(key !== 'features'){
                out[key]=fc[key];
            }
        }
        out.features = fc.features.map(self.feature);
        return out;
    };
}

function toWGS84(geojson,srs){
    var trans = proj4(srs);
    var tFunc = new transformGeojson(function(c){return trans.inverse(c);});
    return tFunc.featureCollection(geojson);
}
function fromWGS84(geojson,srs){
    var trans = proj4(srs);
    var tFunc = new transformGeojson(function(c){return trans.forward(c);});
    return tFunc.featureCollection(geojson);
}
exports.to = exports.toWGS84 = toWGS84;
exports.from = exports.fromWGS84 = fromWGS84;