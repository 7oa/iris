(function () {
    angular.module('iris_maps_layers', []);

    angular.module('iris_maps_layers').factory('ProjectDeviceGeoData', function ($resource) {
        return $resource(iris.config.apiUrl + "/tunneling/projects/:project_id/devices/:id/:action", {
            id: '@id',
            project_id: '@project_id',
            action: '@action'
        }, {
            getPosition: {
                method: "GET",
                params: {action: 'position'}
            },
            getAlignment: {
                method: "GET",
                params: {action: 'alignment'}
            }
        });
    });

    angular.module('iris_maps_layers').factory('LayerHelpers',
        function ($filter, $translate) {
            var layer_group_types = [{
                name: $translate.instant('label.maps.TBMsAndTunnels'),
                alias_prefix: 'tbm_',
                alias: 'tbm',
                type: 'tbm',
                settings: {
                    view: {
                        icon: 'fa-location-arrow'
                    },
                    ol: {
                        visible: true,
                        opacity: 1,
                        type: 'Group'
                    }
                },
                is_project: false,
                is_multiple: true,
                default: 'tbm'
            }, {
                name: $translate.instant('label.maps.CADData'),
                alias_prefix: 'cad_',
                type: 'cad',
                settings: {
                    view: {
                        icon: 'fa-database'
                    },
                    ol: {
                        visible: true,
                        opacity: 1,
                        type: 'Group'
                    }
                },
                is_project: true,
                is_multiple: true,
                default: 'cad'
            }, {
                name: $translate.instant('label.Image'),
                alias_prefix: 'image_',
                type: 'image',
                settings: {
                    view: {
                        icon: 'fa-image'
                    },
                    ol: {
                        visible: true,
                        opacity: 1,
                        type: 'Group'
                    }
                },
                is_project: true,
                is_multiple: true,
                default: 'image'
            }, /*{
             name: $translate.instant('label.Rings'),
             alias_prefix: 'rings_',
             type: 'rings',
             settings: {
             view: {
             icon: 'fa-circle-o-notch'
             },
             ol: {
             visible: true,
             opacity: 1,
             type: 'Group'
             }
             },
             is_project: true,
             is_multiple: false,
             default: 'rings'
             },*/ {
                name: $translate.instant('label.maps.CustomPoints'),
                alias_prefix: 'points_',
                type: 'points',
                settings: {
                    view: {
                        icon: 'fa-map-marker'
                    },
                    ol: {
                        visible: true,
                        opacity: 1,
                        type: 'Group'
                    }
                },
                is_project: false,
                is_multiple: false,
                default: 'points'
            }];

            var layer_types = [{
                name: $translate.instant('label.TBM'),
                type: 'tbm',
                layer_group_type: 'tbm'
            }, {
                name: $translate.instant('label.Tunnel'),
                type: 'tunnel',
                layer_group_type: 'tbm'
            }, {
                name: $translate.instant('label.maps.CADData'),
                type: 'cad',
                layer_group_type: 'cad'
            }, {
                name: $translate.instant('label.Image'),
                type: 'image',
                layer_group_type: 'image'
            }, {
                name: $translate.instant('label.maps.CustomPoints'),
                type: 'points',
                layer_group_type: 'points'
            }/*, {
             name: $translate.instant('label.maps.Sensors'),
             type: 'sensors',
             layer_group_type: 'sensors'
             }, {
             name: $translate.instant('label.Documents'),
             type: 'points',
             layer_group_type: 'docs'
             }, {
             name: $translate.instant('label.Rings'),
             type: 'rings',
             layer_group_type: 'rings'
             }*/];

            return {
                getLayerGroupTypes: function () {
                    return layer_group_types;
                },
                getLayerGroupType: function (type) {
                    return $filter('filter')(layer_group_types, {type: type})[0];
                },

                getLayerTypes: function (filter) {
                    if (filter) return $filter('filter')(layer_types, filter, true);
                    return layer_types;
                },
                getLayerType: function (type) {
                    return $filter('filter')(layer_types, {type: type})[0];
                },

                getDefaultSettings: function () {
                    return {
                        ol: {
                            visible: true,
                            opacity: 1,
                            style: {
                                COLOR: '#93be3d',
                                COLOR_BACK: '#93be3d',
                                fill: '#424242',
                                width: 3
                            }
                        }
                    };
                }
            };
        });

    angular.module('iris_maps_layers').factory('LayersService',
        function ($filter, $timeout, $translate, $q, Layers, LayerHelpers, Markers, irisPermalink, MapService, ProjectsService, MapHelpers, Images, ImageService) {

            var bg_layers = Layers.query({}, function (layers) {
                for (var i = 0, c = layers.length; i < c; i++) {
                    var layer = layers[i];
                    // support previous versions with device_id in settings
                    layer.device_id = layer.device_id || layer.settings.device_id;
                    for (var j in layer.markers) {
                        layer.markers[j] = new Markers(layer.markers[j]);
                    }
                }
                return layers;
            });

            var ol_layers = [];
            var selected_layers_ids = [];

            return {
                getOlLayers: function () {
                    return ol_layers;
                },

                getSelectedLayersIds: function () {
                    return selected_layers_ids;
                },

                getLayers: function () {
                    return bg_layers;
                },

                setBgLayers: function (layers) {
                    bg_layers = layers;
                },

                getLayersByTypes: (typesArray) => {
                    return bg_layers.filter(layer => typesArray.indexOf(layer.type) >= 0)
                },

                createLayer: function (project_id) {
                    var params = {
                        project_id: project_id,
                        settings: angular.copy(LayerHelpers.getDefaultSettings())
                    };
                    return new Layers(params);
                },

                saveLayer: function (layer) {
                    var is_new = !layer.id > 0;
                    return layer.$save({}, function (value) {
                        if (is_new) {
                            bg_layers.push(value);
                        }
                        return value;
                    });
                },

                getLayerById: function (id) {
                    return $filter('filter')(bg_layers, {id: +id}, true)[0];
                },

                filter: function (filter, strict) {
                    strict = strict || true;
                    return $filter('filter')(bg_layers, filter, strict);
                },

                toggleFavorite: function (layer) {
                    return Layers.toggleFavorite({id: layer.id}, function (value) {
                        layer.layer_user_settings[0] = value;
                        return layer;
                    });
                },

                removeLayer: function (layer) {
                    return layer.$remove({}, function (value) {
                        for (var i = 0, c = bg_layers.length; i < c; i++) {
                            if (bg_layers[i].id == value.id) {
                                bg_layers.splice(i, 1);
                                break;
                            }
                        }
                        return value;
                    });
                },

                createOlLayer: function (layer, toggleLayerSelected) {
                    var project = ProjectsService.getByIdInTree(layer.project_id),
                        device = project && project.devices ? project.devices.filter(device => device.id == layer.device_id)[0] : null;
                    layer.device = device;
                    if (layer.device && layer.device.current_state && !layer.device.current_state.$resolved) {
                        layer.device.current_state.then(function (status) {
                            layer.device.current_state = status;
                        });
                    }
                    layer.project = project;

                    if (layer.type == 'tbm' && device) {
                        // Creating a TBM figure as a polygon
                        layer.ol = {
                            //min_zoom: 18,
                            source: {
                                type: 'GeoJSON',
                                geojson: {
                                    object: {
                                        type: "FeatureCollection",
                                        features: [{
                                            type: "Feature",
                                            properties: layer.settings.ol.style,
                                            geometry: {
                                                type: "Polygon",
                                                coordinates: []
                                            },
                                            id: layer.id
                                        }]
                                    },
                                    projection: 'EPSG:4326'
                                }
                            },
                            style: MapService.styleFunction,
                            opacity: layer.settings.ol.opacity,
                            visible: true
                        };

                        // This center used for zoomTo option
                        layer.center = {
                            lon: 0,
                            lat: 0,
                            zoom: 20
                        };

                        // TODO let tbm marker have the same overlay as the layer
                        // Add marker that indicates the TBM
                        // when zoom is too small to see it
                        layer.markers = [{
                            id: 'marker_for_' + layer.id,
                            layer_id: layer.id,
                            name: layer.device.name,
                            description: '',
                            position: {
                                lon: 0,
                                lat: 0
                            },
                            settings: {
                                max_zoom: 16,
                                label: {
                                    message: `<p>${layer.device.name}</p>`,
                                    show: false,
                                    showOnClick: true,
                                    type: 'html'
                                    //url: iris.config.baseUrl + '/templates/maps.marker.overlay.htm'
                                }
                            },
                            style: {
                                image: {
                                    regularshape: {
                                        fill: {
                                            color: layer.settings.ol.style.fill
                                        },
                                        stroke: {
                                            color: layer.settings.ol.style.COLOR,
                                            width: layer.settings.ol.style.width,
                                        },
                                        points: 3,
                                        radius: 10,
                                        rotation: 0
                                    }
                                }
                            }
                        }];

                        this.updateDevicePosition(layer);
                    } else if (layer.type == 'tunnel' && device) {
                        if (!layer.alignment || !layer.alignment.alignmentPoints || !layer.alignment.alignmentPoints.length) {
                            alertify.error($translate.instant('text.NoAlignmentInfoAvailable'));
                            return;
                        }

                        //todo please don't remove this code
                        /*var geojson = {
                         type: "FeatureCollection",
                         features: []
                         };

                         for (var k in points) {
                         if (k == 0) continue;
                         geojson.features.push({
                         type: "Feature",
                         geometry: {
                         type: "Polygon",
                         coordinates: [
                         MapHelpers.getRingCoords(coords[k][0], coords[k][1], coords[k - 1][0], coords[k - 1][1], 2, 10)
                         ]
                         },
                         //properties: layer.settings.ol.style
                         properties: {
                         index: k,
                         value: points[k]
                         }
                         })
                         }*/

                        var feature = {
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: []
                            },
                            id: layer.id
                        };
                        var feature2 = angular.copy(feature);
                        feature2.id = feature2.id + '_BACK';

                        layer.ol = {
                            source: {
                                type: 'GeoJSON',
                                geojson: {
                                    object: {
                                        type: "FeatureCollection",
                                        features: [feature, feature2]
                                    },
                                    projection: 'EPSG:4326'
                                }
                            },
                            style: MapService.styleFunction,
                            opacity: layer.settings.ol.opacity,
                            visible: true,
                            id: layer.id
                        };

                        layer.center = {lat: 0, lon: 0, zoom: 15};

                        this.updateDeviceAlignment(layer);
                    } else if (layer.type == 'points') {
                        layer.ol = {
                            name: $translate.instant('label.maps.CustomPoints'),
                            alias: 'custom_points',
                            visible: true,
                            source: {
                                type: 'GeoJSON',
                                geojson: {
                                    object: {
                                        type: "FeatureCollection",
                                        features: []
                                    }
                                }
                            },
                            opacity: 1,
                            id: layer.id
                        };
                    } else if (layer.type == 'cad') {
                        layer.ol = {
                            source: {
                                type: 'GeoJSON',
                                url: iris.config.apiUrl + '/maps/cads/' + layer.settings.cad.id + '/data/' + MapService.getZoom(),
                                projection: 'EPSG:4326'
                            },
                            style: MapService.styleFunction,
                            opacity: layer.settings.ol.opacity,
                            visible: true,
                            id: layer.id
                        }
                    } else if (layer.type == 'image') {
                        layer.ol = {
                            source: {},
                            type: "Tile",
                            active: true,
                            visible: true,
                            opacity: layer.settings.ol.opacity,
                            id: layer.id
                        }
                        var image = Images.getByProjectIdAndAlias({
                            project_id: layer.project_id,
                            alias: layer.settings.image
                        }, function (image) {
                            return image;
                        });
                        var promises = [];
                        promises.push(image.$promise.then(function (value) {
                            return value;
                        }));
                        iris.loader.start();
                        $q.all(promises).then(function () {
                            ImageService.createOlImageOverlay(image, layer);
                            iris.loader.stop();
                        });
                    }

                    layer.ol.customAttributes = { layer_id: layer.id }
                    layer.ol.name = layer.type;

                    var self = this;
                    layer.toggleFavorite = function (layer) {
                        self.toggleFavorite(layer);
                    };

                    layer.toggleLayerSelected = function (layer) {
                        toggleLayerSelected(layer)
                    }
                },

                //todo
                moveLayer: function (evt, layer, delta) {
                    var index = MapService.getOlLayerIndex(layer.id);
                    if (index < 0) {
                        console.log('Cant find the OlLayer');
                        return;
                    }

                    var layersCollection = MapService.getMap().getLayers();
                    var ol_layer = layersCollection.removeAt(index);
                    layersCollection.insertAt(index + delta, ol_layer);

                    //todo move markers of the layer too
                    //todo take care of hidden layers

                    //update order of layers
                    for (var i = 0, c = bg_layers.length; i < c; i++) {
                        var order = MapService.getOlLayerIndex(bg_layers[i].id);
                        if (order >= 0) {
                            bg_layers[i].order = order;
                        }
                    }

                    index = selected_layers_ids.indexOf(layer.id);
                    selected_layers_ids.splice(index, 1);
                    selected_layers_ids.splice(index + delta, 0, layer.id);
                    irisPermalink.updateParams({layers: selected_layers_ids.join(',')});
                    evt.preventDefault();
                },

                calcDevicePosition: function (position, device) {
                    var d = device.settings || {},
                        device_length = d && d.machineLength ? d.machineLength : 10,
                        device_width = d && d.shieldOuterDiameter ? d.shieldOuterDiameter : 10;
                    if (!position || position.front_easting == null || position.front_northing == null || position.rear_easting == null || position.rear_northing == null) {
                        alertify.error($translate.instant('text.NoPositionInfoAvailable'));
                        return;
                    }
                    var x1 = position.front_easting,
                        y1 = position.front_northing,
                        x2 = position.rear_easting,
                        y2 = position.rear_northing,
                        angle_rad = MapHelpers.getBearing(x2, y2, x1, y1).toRadians(), //tbm moves from 2 to 1
                        tbm_coords = MapHelpers.getTBMCoords(x1, y1, x2, y2, device_length, device_width);

                    return {angle_rad, tbm_coords, x1, y1};
                },

                updateDevicePosition: function (layer) {
                    if (!layer.ol) return;

                    var device_position = this.calcDevicePosition(layer.position, layer.device);
                    if (!device_position) return;

                    // Device polygon coordinates
                    layer.ol.source.geojson.object.features[0].geometry.coordinates = [device_position.tbm_coords];

                    // Triangle angle
                    layer.markers[0].style.image.regularshape.rotation = device_position.angle_rad;

                    // Position for Marker
                    layer.markers[0].position.lon = device_position.x1;
                    layer.markers[0].position.lat = device_position.y1;

                    // This center used for zoomTo option
                    layer.center = {
                        lon: device_position.x1,
                        lat: device_position.y1,
                        zoom: 19
                    };
                },

                updateDeviceAlignment: function (layer) {
                    if (!layer.ol) return;

                    var coords = layer.alignment.alignmentPoints.reduce((result, point) => {
                        var coord = [point.northingWGS84 * 180 / Math.PI, point.eastingWGS84 * 180 / Math.PI];
                        if (point.chainage > layer.boundaries.endChainage) {
                            result.afterDevice.push(coord)
                        } else {
                            result.beforeDevice.push(coord)
                        }
                        return result
                    }, {
                        afterDevice: [],
                        beforeDevice: []
                    });

                    var style = layer.settings.ol.style;
                    var style2 = angular.copy(style);
                    style2["COLOR"] = style2["COLOR_BACK"] || "#93be3d";
                    style2["width"] = +style2["width"] * 2;

                    // Draw 2 lines
                    layer.ol.source.geojson.object.features[0].geometry.coordinates = coords.afterDevice;
                    layer.ol.source.geojson.object.features[0].properties = style;
                    layer.ol.source.geojson.object.features[1].geometry.coordinates = coords.beforeDevice;
                    layer.ol.source.geojson.object.features[1].properties = style2;

                    // This center used for zoomTo option
                    layer.center = {
                        lat: coords.afterDevice ? coords.afterDevice[0][1] : coords.beforeDevice[0][1],
                        lon: coords.afterDevice ? coords.afterDevice[0][0] : coords.beforeDevice[0][0],
                        zoom: 19
                    };
                }
            }
        });

    angular.module('iris_maps_layers').factory('Layers', function ($resource) {
        return $resource(iris.config.apiUrl + "/maps/layers/:id/:action", {
            id: '@id'
        }, {
            toggleFavorite: {
                method: "POST",
                params: {action: 'favorite'}
            }
        });
    });
})();
