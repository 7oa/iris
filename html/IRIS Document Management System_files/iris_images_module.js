(function () {

    angular.module('iris_images').factory('Images', function ($resource) {
        return $resource(iris.config.apiUrl + "/images/images/:id", {
            id: '@id'
        }, {
            getByProjectId: {
                url: iris.config.apiUrl + "/images/images/project/:project_id",
                params: {
                    project_id: '@project_id'
                },
                method: "GET",
                isArray: true
            },
            getByProjectIdAndGeoType: {
                url: iris.config.apiUrl + "/images/images/project/:project_id/geo/:geo_type",
                params: {
                    project_id: '@project_id',
                    geo_type: '@geo_type'
                },
                method: "GET",
                isArray: true
            },
            getByProjectIdAndAlias: {
                url: iris.config.apiUrl + "/images/images/project/:project_id/alias/:alias/",
                params: {
                    project_id: '@project_id',
                    alias: '@alias'
                },
                method: "GET",
                isArray: false
            }
        });
    });

    angular.module('iris_images').factory('ImageService', ['Images', 'irisPermalink', 'olData', 'ImageHelpers',
        function (Images, irisPermalink, olData, ImageHelpers) {

            var images;

            var refreshImages = function (projectId) {
                return Images.getByProjectId({project_id: projectId}).$promise.then(result => {
                    images = result;
                });
            };

            var getOlForImage = function (image) {

                var url = iris.config.apiUrl + "/images/tiles/" + image.id + "/{z}/{x}/{y}";
                var attribution = image.alias;
                image.settings.center.projection = 'pixel';
                /* workaround for ol-directive not checking center.coord at olHelper setCenter: function (view, projection, newCenter, map) */
                image.settings.center.lon = image.settings.center.coord[0];
                image.settings.center.lat = image.settings.center.coord[1];

                var ol = {
                    projection: 'pixel',
                    baselayer: {
                        projection: 'pixel',
                        source: {
                            type: 'TileImage',
                            projection: 'pixel',
                            url: url,
                            attribution: attribution,
                            tileGrid: {
                                origin: [image.origin_left, image.origin_top],
                                extent: [0, -image.image_height, image.image_width, 0],
                                resolutions: getResolutionsForMaxZoom(image.max_zoom)
                            }
                        },
                        type: "Tile",
                        active: true,
                        visible: true,
                        opacity: 1
                    },
                    defaults: {
                        alias: 'pixel',
                        view: {
                            projection: 'pixel',
                            extent: [0, -image.image_height, image.image_width, 0],
                            minZoom: image.min_zoom,
                            maxZoom: image.max_zoom
                        },
                        events: {map: ['singleclick', 'pointermove'], layers: ['click']},
                        center: image.settings.center
                    },
                    center: angular.copy(image.settings.center),
                    controls: {
                        attribution: true,
                        rotate: false,
                        zoom: true,
                        fullscreen: true
                    }
                };
                console.log(ol);
                return ol;
            };

            var getOlForOverlay = function (image, layer) {
                var url = iris.config.apiUrl + "/images/tiles/" + image.id + "/{z}/{x}/{y}";
                var attribution = image.alias;
                if (image.geo_type === 'aerial') {
                    var image_width_px = image.image_width;
                    var image_height_px = -image.image_height;
                    // var origin = ImageHelpers.getXandYForPixelCoord([image.origin_left, image.origin_top], image_width_px, image_height_px, image.geo_settings);
                    var p1 = ImageHelpers.getXandYForPixelCoord([image.origin_left, image.origin_top], image_width_px, image_height_px, image.geo_settings);
                    var p2 = ImageHelpers.getXandYForPixelCoord([image_width_px - image.origin_left, image_height_px - image.origin_top], image_width_px, image_height_px, image.geo_settings);
                    var extent = [p1[0], p2[1], p2[0], p1[1]];
                    // extent = [image.geo_settings.easting_left, image.geo_settings.northing_bottom, image.geo_settings.easting_right, image.geo_settings.northing_top];
                    console.log(extent);
                    var tiles_projection = new ol.proj.Projection({
                        code: image.geo_settings.projection || 'EPSG:4326',
                        units: image.geo_settings.projection || 'EPSG:4326',
                        extent: extent
                    });
                    layer.ol.source = {
                        type: "XYZ",
                        url: url,
                        minZoom: image.min_zoom,
                        maxZoom: image.max_zoom,
                        projection: tiles_projection,
                    };
                    console.log(layer.ol);
                }
            }

            var getResolutionsForMaxZoom = function (maxZoom) {
                var resolutions = Array(maxZoom + 1);
                for (var i = 0; i <= maxZoom; i++) {
                    resolutions[i] = Math.pow(2, maxZoom - i);
                }
                return resolutions;
            }

            var olMap = null;
            var updateMap = function () {
                olData.getMap().then(value => olMap = value);
            }
            updateMap();

            return {
                createOlImage: function (image) {
                    image.ol = getOlForImage(image);
                },

                createOlImageOverlay: function (image, layer) {
                    getOlForOverlay(image, layer);
                },

                updateImgMap: updateMap,

                getImgMap: function () {
                    return olMap;
                },

                getImages: function () {
                    return images;
                },

                getImageControls: function () {
                    return image_controls;
                },

                setCenter: function (image, center) {
                    if (image.ol) {
                        angular.copy(center, image.ol.center);
                    }
                },

                refreshImages: function (projectId) {
                    return projectId ? refreshImages(projectId) : [];
                },

                saveImage: function (image) {
                    var is_new = !image.id;
                    if (image.settings && image.settings.center) {
                        delete image.settings.center.projection;
                        delete image.settings.center.lon;
                        delete image.settings.center.lat;
                    }
                    return image.$save(function (result) {
                        angular.extend(image, result);
                        if (is_new) {
                            images.push(image);
                        }
                        return result;
                    });
                },

                deleteImage: function (image) {
                    return Images.delete({id: image.id}).$promise;
                },

                getDownloadLink: function(image) {
                    return iris.config.apiUrl + "/images/images/download/" + image.id;
                },

                getCanvas: function () {
                    var canvas;
                    if (olMap) {
                        var target = olMap.getTarget();
                        canvas = angular.element(target).find('canvas')[0];
                    }
                    return canvas;
                },

                // functions just for configuration tool:

                getImagesForProject: function (projectId) {
                    return Images.getByProjectId({project_id: projectId}).$promise;
                },
                getImageForId: function (id) {
                    return Images.get({id: id});
                }
            };
        }
    ]);

    angular.module('iris_images').factory('ImageHelpers', [
        function () {

            var getPixelCoord = function (coord, total_px_horizontal, total_px_vertical, geo_settings) {
                if (coord && (coord.length == 2) && geo_settings && geo_settings.alias === 'section') {
                    var left_chainge = geo_settings.chainage_left;
                    var right_chainge = geo_settings.chainage_right;
                    var x_px = ((coord[0] - left_chainge) / (right_chainge - left_chainge)) * total_px_horizontal;

                    var bottom_elevation = geo_settings.elevation_bottom;
                    var top_elevation = geo_settings.elevation_top;
                    var y_px = ((top_elevation - coord[1]) / (top_elevation - bottom_elevation)) * total_px_vertical;

                    return [x_px, y_px];
                }
            };

            var isPixelCoordInImage = function (coord, total_px_horizontal, total_px_vertical) {
                // coord[0] positive and coord[1] negative
                return (coord[0] >= 0 && coord[0] <= total_px_horizontal &&
                coord[1] <= 0 && coord[1] >= total_px_vertical);
            }

            return {

                getXandYForPixelCoord: function (coord, total_px_horizontal, total_px_vertical, geo_settings) {
                    var result = [];
                    if (coord && (coord.length == 2) && geo_settings) {
                        var left_x, right_x;
                        if (geo_settings.alias === 'section') {
                            left_x = geo_settings.chainage_left;
                            right_x = geo_settings.chainage_right;
                        } else if (geo_settings.alias === 'aerial') {
                            left_x = geo_settings.easting_left;
                            right_x = geo_settings.easting_right;
                        }
                        var x = left_x + (coord[0] / total_px_horizontal) * (right_x - left_x);

                        var bottom_y, top_y;
                        if (geo_settings.alias === 'section') {
                            bottom_y = geo_settings.elevation_bottom;
                            top_y = geo_settings.elevation_top;
                        } else if (geo_settings.alias === 'aerial') {
                            bottom_y = geo_settings.northing_bottom;
                            top_y = geo_settings.northing_top;
                        }
                        var y = top_y - (coord[1] / total_px_vertical) * (top_y - bottom_y);

                        result = [x, y];
                    }
                    return result;
                },

                createGeosensorsGEOJsonLayers: function (image) {
                    image.sensors = {};
                    image.geometryList.forEach(geometry => {
                        var geosensorType = geometry.geosensor.geosensorType;
                        if (image.sensors[geosensorType.alias] === undefined) {
                            var id = 'sensortype_' + geosensorType.alias;
                            image.sensors[geosensorType.alias] = {
                                name: 'geojson',
                                id: id,
                                customAttributes: {layer_id: id},
                                geosensorType: geosensorType,
                                source: {
                                    style: geosensorType.style,
                                    type: 'GeoJSON',
                                    geojson: {
                                        object: {
                                            type: 'FeatureCollection',
                                            features: []
                                        }
                                    }
                                },
                                style: geosensorType.style,
                                opacity: 1,
                                visible: true
                            };
                        }
                        image.sensors[geosensorType.alias].source.geojson.object.features.push({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: geometry.coordinates
                            },
                            properties: {
                                name: geometry.geosensor.sensor.name
                            }
                        })
                    });
                },

                getTBMGEOJson: function (device, id, image) {

                    var tbm_coords = [];
                    var position = device.position;
                    var geo_settings = image.geo_settings;

                    if (position && geo_settings && geo_settings.alias === 'section') {

                        var device_length = 50;
                        var device_width = 10;

                        if (device.settings) {
                            device_length = device.settings.machineLength || 50;
                            device_width = device.settings.shieldOuterDiameter || 10;
                        }

                        var left_chainge = geo_settings.chainage_left;
                        var right_chainge = geo_settings.chainage_right;

                        var bottom_elevation = geo_settings.elevation_bottom;
                        var top_elevation = geo_settings.elevation_top;

                        var image_width_px = image.image_width;
                        var image_height_px = -image.image_height;

                        var px_coord = getPixelCoord([position.front_chainage, position.front_elevation], image_width_px, image_height_px, geo_settings);

                        var device_length_px = (device_length / (right_chainge - left_chainge)) * image_width_px;
                        var device_width_px = (device_width / (top_elevation - bottom_elevation)) * image_height_px;

                        if (isPixelCoordInImage(px_coord, image_width_px, image_height_px)) {
                            tbm_coords = [[
                                [px_coord[0] - device_length_px, px_coord[1] - device_width_px / 2],
                                [px_coord[0] - device_length_px, px_coord[1] + device_width_px / 2],
                                [px_coord[0], px_coord[1] + device_width_px / 2],

                                // 3 additional poins for pin at front
                                [px_coord[0], px_coord[1] + device_width_px / 6],
                                [px_coord[0] - device_width_px / 6, px_coord[1]],
                                [px_coord[0], px_coord[1] - device_width_px / 6],
                                //
                                [px_coord[0], px_coord[1] - device_width_px / 2]
                            ]];
                        }
                    }
                    if (tbm_coords.length) {
                        var geoJson = {
                            name: "geojson",
                            id: id,
                            device: device.name,
                            customAttributes: {layer_id: id},
                            visible: true,
                            opacity: 1,
                            source: {
                                type: 'GeoJSON',
                                geojson: {
                                    object: {
                                        type: "FeatureCollection",
                                        features: [{
                                            type: "Feature",
                                            geometry: {
                                                type: "Polygon",
                                                coordinates: tbm_coords
                                            },
                                            properties: {
                                                name: "TBM"
                                            }
                                        }]
                                    }
                                }
                            },
                            style: {
                                fill: {
                                    color: 'rgba(255, 0, 0, 0.6)'
                                },
                                stroke: {
                                    color: 'black',
                                    width: 2
                                }
                            }
                        };
                        return geoJson;
                    }
                },

                getAlignmentGEOJson: function (device, id, image) {

                    var alignment_coords = [];
                    var alignment = device.alignment;
                    var geo_settings = image.geo_settings;

                    if (alignment && alignment.alignmentPoints && geo_settings && geo_settings.alias === 'section') {

                        var left_chainge = geo_settings.chainage_left;
                        var right_chainge = geo_settings.chainage_right;

                        var bottom_elevation = geo_settings.elevation_bottom;
                        var top_elevation = geo_settings.elevation_top;

                        var image_width_px = image.image_width;
                        var image_height_px = -image.image_height;

                        for (var i = 0; i < alignment.alignmentPoints.length; i++) {
                            var coord = alignment.alignmentPoints[i];
                            var px_coords = getPixelCoord([coord.chainage, coord.elevation], image_width_px, image_height_px, geo_settings);
                            if (isPixelCoordInImage(px_coords, image_width_px, image_height_px)) {
                                alignment_coords.push(px_coords);
                            }
                        }
                    }
                    if (alignment_coords.length) {
                        var geoJson = {
                            name: "geojson",
                            id: id,
                            device: device.name,
                            customAttributes: {layer_id: id},
                            visible: true,
                            opacity: 1,
                            source: {
                                type: 'GeoJSON',
                                geojson: {
                                    object: {
                                        type: "FeatureCollection",
                                        features: [{
                                            type: "Feature",
                                            geometry: {
                                                type: "LineString",
                                                coordinates: alignment_coords
                                            },
                                            properties: {
                                                name: "Alignment"
                                            }
                                        }]
                                    }
                                }
                            },
                            style: {
                                stroke: {
                                    color: 'blue',
                                    width: 3
                                }
                            }
                        };
                        return geoJson;
                    }
                }
            };
        }
    ]);

    angular.module('iris_images').factory('ImageTileSettings', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/images/tiles/:imageId/:z/:x/:y", {
            image_id: '@imageId',
            z: '@z',
            x: '@x',
            y: '@y'
        });
    }]);

    angular.module('iris_images').factory('TileService', ['ImageTileSettings',
        function (ImageTiles) {
            return {
                getTileByImageAndZXY: function (imageId, z, x, y) {
                    return ImageTiles.get({imageId: imageId, z: z, x: x, y: y}).$promise;
                }
            };
        }]);
})();
