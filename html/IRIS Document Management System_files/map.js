(function () {
    angular.module('iris_maps_map', ['iris_maps_layers_manager']);

    angular.module('iris_maps_map').factory('MapSettings', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/global-settings/:alias", {
            alias: '@alias'
        });
    }]);

    angular.module('iris_maps_map').factory('MapService', ['MapSettings', 'irisPermalink', 'olData',
        function (MapSettings, irisPermalink, olData) {

            var map_projections = {
                std: {
                    center: {
                        projection: 'EPSG:4326'
                    },
                    defaults: {
                        view: {
                            projection: 'EPSG:3857',
                            maxZoom: 21,
                            minZoom: 3
                        },
                        alias: 'std'
                    }
                },
                // for Sluiskil example
                'EPSG:28992': {
                    center: {
                        projection: 'EPSG:28992'
                    },
                    defaults: {
                        view: {
                            projection: 'EPSG:28992'
                        },
                        alias: 'EPSG:28992'
                    },
                    name: "Amersfoort / RD New",
                    proj4: "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000  +ellps=bessel  +towgs84=565.040,49.910,465.840,-0.40939,0.35971,-1.86849,4.0772 +units=m +no_defs"
                },
                // for LA Crenshaw example
                'EPSG:26945': {
                    center: {
                        projection: 'EPSG:26945'
                    },
                    defaults: {
                        view: {
                            projection: 'EPSG:26945'
                        },
                        alias: 'EPSG:26945'
                    },
                    name: "NAD83 / California zone 5",
                    proj4: "+proj=lcc +lat_1=35.46666666666667 +lat_2=34.03333333333333 +lat_0=33.5 +lon_0=-118 +x_0=2000000 +y_0=500000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs"
                },
                google: {
                    center: {
                        projection: 'EPSG:4326'
                    },
                    defaults: {
                        view: {
                            projection: 'EPSG:3857',
                            maxZoom: 19,
                            minZoom: 3
                        },
                        alias: 'google'
                    }
                }
            };

            var map_settings = {
                settings: {},
                mouseposition: {},
                mouseclickposition: {},
                projection: 'EPSG:4326',
                company: {
                    map: {
                        name: 'Map layer',
                        alias: 'map',
                        visible: true,
                        source: {
                            type: "OSM",
                            name: 'OpenStreetMaps',
                            alias: 'osm'
                        },
                        opacity: 1
                    },
                    selected_project_id: null,
                    max_zoom: 11
                },
                pinned_objects: []
            };

            var map_sources = {
                osm: {
                    name: 'OpenStreetMaps',
                    alias: 'osm',
                    type: 'OSM'
                },
                bing: {
                    name: 'Bing',
                    alias: 'bing',
                    type: 'BingMaps',
                    key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
                    imagerySet: 'Road'
                },
                google_roadmap: {
                    name: 'Google Maps Roadmap',
                    alias: 'google_roadmap',
                    type: 'ROADMAP',
                    projection: 'google'
                },
                google_hybrid: {
                    name: 'Google Maps Hybrid',
                    alias: 'google_hybrid',
                    type: 'HYBRID',
                    projection: 'google'
                }
                /*
                 * mapquest team is discontinued to access their tiles from 11th July 2016
                 * http://devblog.mapquest.com/2016/06/15/modernization-of-mapquest-results-in-changes-to-open-tile-access/
                 */
            };

            var map_default_settings = {
                projection: 'EPSG:4326',
                center: {
                    lat: 52.51,
                    lon: 13.39,
                    zoom: 9,
                    projection: 'EPSG:4326'
                },
                defaults: {
                    view: {}
                },
                view: {},
                projections: map_projections,
                maps: map_sources
            };

            var projections = [{
                projection: 'EPSG:4326'
            }, {
                projection: 'EPSG:28992'
            }, {
                projection: 'EPSG:31467'
            }];

            var map_defaults = MapSettings.get({alias: 'maps'}, function (value) {
                // If there are no properties in DB - set Berlin as a map center
                value.value = value.value || {};
                value.value = angular.extend(angular.copy(map_default_settings), value.value);

                if (proj4) {
                    for (var p in value.value.projections) {
                        var proj = value.value.projections[p];
                        if (proj.proj4) {
                            proj4.defs(proj.defaults.alias, proj.proj4);
                        }
                    }

                    var removeMaps = [];
                    for (var m in value.value.maps) {
                        var map = value.value.maps[m];
                        var proj = map.projection;
                        if (proj && !value.value.projections[proj]) {
                            removeMaps.push(m);
                        }
                    }
                    for (var i = 0; i < removeMaps.length; i++) {
                        delete value.value.maps[removeMaps[i]];
                    }
                } else {
                    console.log("'proj4' is not defined!")
                }

                //if no settings were setted up (first app launch)
                value.alias = 'maps';

                return value;
            });

            var map = null;
            var updateMap = function () {
                olData.getMap().then(value => map = value);
            }
            updateMap();

            return {

                updateMap: updateMap,

                getMap: function () {
                    return map;
                },

                getMapSettings: function () {
                    return map_settings;
                },

                getMapDefaults: function () {
                    return map_defaults;
                },

                saveMapSettings: function (settings) {
                    map_defaults.value = angular.copy(settings);
                    return map_defaults.$save({alias: 'maps'}, function (result) {
                        return result;
                    });
                },

                resetMapSettings: function () {
                    map_defaults.value = angular.copy(map_default_settings);
                    return map_defaults.$save({alias: 'maps'}, function (result) {
                        return result;
                    });
                },

                styleFunction: styleFunction,

                getProjections: function () {
                    return projections;
                },

                getOlLayerIndex: function (id) {
                    var ol_layers = map.getLayers(),
                        index = -1;
                    for (var i = 0, c = ol_layers.getLength(); i < c; i++) {
                        if (ol_layers.item(i).getProperties().layer_id == id) {
                            index = i;
                            break;
                        }
                    }
                    return index;
                },

                getOlMapLayer: function(id) {
                    var ol_layers = map.getLayers();
                    for (var i = 0, c = ol_layers.getLength(); i < c; i++) {
                        var layer = ol_layers.item(i);
                        if (layer.getProperties().layer_id == id) {
                            return layer;
                        }
                    }
                },

                getZoom: function () {
                    if (map_settings.settings &&
                        map_settings.settings.center &&
                        map_settings.settings.center.zoom) {
                        var zoom = map_settings.settings.center.zoom;
                        //TODO: make parameters depend on extend of cad-layer
                        if (zoom < 17) {
                            return '0.00009 true 1 0.0002 100000';
                        } else if (zoom < 18) {
                            return '0.00009 true 1 0.00002 1000000';
                        }
                    }
                    return 'original';
                },

                setCenter: function (lat, lon, zoom) {
                    map_settings.settings.center = {
                        lat: lat ? lat : 0,
                        lon: lon ? lon : 0,
                        zoom: zoom ? zoom : 15
                    };
                },

                zoomToLayer: function(layer) {
                    this.zoomToLayers([layer]);
                },

                zoomToLayers: function(layers) {
                    var extent = ol.extent.createEmpty();
                    var mapProjection = map.getView().getProjection();
                    layers.forEach(layer => {
                        var olMapLayer = this.getOlMapLayer(layer.id);
                        if (olMapLayer) {
                            var sourceProjection = (layer.type === 'points') ? ol.proj.get('EPSG:4326') : mapProjection;
                            ol.extent.extend(extent, getLayerExtent(olMapLayer, sourceProjection, mapProjection));
                            layer.markers.forEach(marker => {
                                ol.extent.extend(extent, getMarkerExtent(marker, mapProjection));
                            });
                        } else {
                            console.log('OL layer not found for layer.')
                            console.log(layer);
                        }
                    });
                    if (extent && !ol.extent.isEmpty(extent) && !ol.extent.equals(ol.extent.createEmpty(), extent)) {
                        console.log('zoom to extent: ' + extent);
                        map.getView().fit(extent, map.getSize(), {padding:[10, 10, 10, 10], maxZoom: 19});
                    }
                },

                getCanvas: function() {
                    var canvas;
                    if (map) {
                        var target = map.getTarget();
                        canvas = angular.element(target).find('canvas')[0];
                    }
                    return canvas;
                }
            };

            function getMarkerExtent(marker, targetProjection) {
                var sourceProjection = ol.proj.get(marker.position.projection) || ol.proj.get('EPSG:4326');
                var coord = ol.proj.transform([marker.position.lon, marker.position.lat], sourceProjection, targetProjection);
                var extent = ol.extent.boundingExtent([coord]);
                return extent;
            }

            function getLayerExtent(olMapsLayer, sourceProjection, targetProjection) {
                var extent = ol.extent.createEmpty();
                if (olMapsLayer instanceof ol.layer.Vector) {
                    // ol.source.Vector
                    var source = olMapsLayer.getSource();
                    sourceProjection = source.getProjection() || sourceProjection;
                    // extent of the features currently in the source
                    extent = source.getExtent();
                } else if (olMapsLayer instanceof ol.layer.Tile) {
                    var source = olMapsLayer.getSource();
                    if (source instanceof ol.source.XYZ || source instanceof ol.source.Tile) {
                        sourceProjection = source.getProjection() || sourceProjection;
                        /*
                        // better solution, but "tileGrid.getExtent()" only works with ol-debug
                        // @TODO please check later versions of ol.js !!
                        var tileGrid = source.getTileGrid();
                        extent = tileGrid.getExtent();
                        */
                        extent = sourceProjection.getExtent();
                    } else {
                        console.log(source);
                        console.log('There is something wrong: Source is not an instanceof ol.source.XYZ or ol.source.Tile');
                        extent = ol.extent.createEmpty();
                    }
                } else {
                    // last option ol.layer.Image not used in IRIS
                    console.log(olMapsLayer);
                    console.log('There is something wrong: Layer is not an instanceof ol.layer.Vector or ol.layer.Tile');
                    extent = ol.extent.createEmpty();
                }
                if (extent && !ol.extent.isEmpty(extent) && !ol.extent.equals(ol.extent.createEmpty(), extent)) {
                    extent = ol.proj.transformExtent(extent, sourceProjection, targetProjection);
                }
                return extent;
            }

            function styleFunction(feature, resolution) {
                var rgb = [0, 0, 0],
                    width = 1,
                    fill = 'red';
                var properties = feature.getProperties();
                if (properties) {
                    rgb = properties.COLOR || rgb;
                    width = properties.width || width;
                    fill = properties.fill || fill;
                }
                return [new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: Array.isArray(rgb) ? 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')' : rgb,
                        width: parseInt(width)
                    }),
                    fill: new ol.style.Fill({color: fill})
                })];
            }

        }
    ]);

    angular.module('iris_maps_map').factory('MapHelpers', [
        function () {
            return {
                getBearing: function (x1, y1, x2, y2) {
                    var p1 = new LatLon(y1, x1);
                    return p1.bearingTo({lon: x2, lat: y2});
                },

                getTBMCoords: function (x1, y1, x2, y2, device_length, device_width) {
                    var p1 = new LatLon(y1, x1),
                        bearing = p1.bearingTo({lon: x2, lat: y2}),
                        p10 = p1.destinationPoint(device_length, bearing),
                        tbm_coords = [],
                        p;

                    p = p1.destinationPoint(device_width / 6, bearing + 180); //9
                    tbm_coords.push([p.lon, p.lat]);
                    p = p1.destinationPoint(device_width / 6, bearing + 90); //3
                    tbm_coords.push([p.lon, p.lat]);
                    p = p1.destinationPoint(device_width / 2, bearing + 90); //4
                    tbm_coords.push([p.lon, p.lat]);
                    p = p10.destinationPoint(device_width / 2, bearing + 90); //5
                    tbm_coords.push([p.lon, p.lat]);
                    tbm_coords.push([p10.lon, p10.lat]);
                    p = p10.destinationPoint(device_width / 2, bearing - 90); //6
                    tbm_coords.push([p.lon, p.lat]);
                    p = p1.destinationPoint(device_width / 2, bearing - 90); //7
                    tbm_coords.push([p.lon, p.lat]);
                    p = p1.destinationPoint(device_width / 6, bearing - 90); //8
                    tbm_coords.push([p.lon, p.lat]);
                    p = p1.destinationPoint(device_width / 6, bearing - 180); //9
                    tbm_coords.push([p.lon, p.lat]);

                    return tbm_coords;
                },

                getRingCoords: function (x2, y2, x1, y1, device_length, device_width) {
                    var p1 = new LatLon(y1, x1),
                        bearing = p1.bearingTo({lon: x2, lat: y2}),
                        p10 = new LatLon(y2, x2),
                        tbm_coords = [],
                        p;

                    tbm_coords.push([p1.lon, p1.lat]);
                    p = p1.destinationPoint(device_width / 2, bearing + 90); //4
                    tbm_coords.push([p.lon, p.lat]);
                    p = p10.destinationPoint(device_width / 2, bearing + 90); //5
                    tbm_coords.push([p.lon, p.lat]);
                    //tbm_coords.push([p10.lon, p10.lat]);
                    p = p10.destinationPoint(device_width / 2, bearing - 90); //6
                    tbm_coords.push([p.lon, p.lat]);
                    p = p1.destinationPoint(device_width / 2, bearing - 90); //7
                    tbm_coords.push([p.lon, p.lat]);
                    tbm_coords.push([p1.lon, p1.lat]);

                    return tbm_coords;
                }
            };
        }
    ]);
})();
