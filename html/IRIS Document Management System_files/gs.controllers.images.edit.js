(function () {

    angular.module('iris_gs_images_edit', []);

    // 'Module' + $filter('PascalCase')(settings) + 'EditCtrl'
    angular.module('iris_gs_images_edit').controller('ModuleImagesEditCtrl',
        function ($scope, $state, $controller, $translate, $timeout, image, mapsSettings,
                  ImageService, ProjectsService, GeosensorsService, GeometryService, ImageHelpers) {

            $scope.image = image;
            $scope.map_settings = mapsSettings;

            $scope.geosensors = [];

            if ($scope.image.settings) {

                function loadSensorsForProject(project_id) {
                    ProjectsService.getProjectDevicesByProjectId(project_id).$promise.then(result => {
                        result.forEach(pd => {
                            GeosensorsService.getByDeviceId(pd.deviceId).then(geosensors => {
                                geosensors.forEach(geosensor => {
                                    var geometry = $scope.image.geometryList.find(it => it.geosensor.id == geosensor.id);
                                    if (geometry === undefined) {
                                        geosensor.name = geosensor.sensor.name;
                                        $scope.geosensors.push(geosensor);
                                    }
                                })
                            })
                        })
                    });
                }

                loadSensorsForProject($scope.image.project_id);
                ProjectsService.getProjectById($scope.image.project_id).projects.forEach(subProject => {
                    loadSensorsForProject(subProject.id);
                });

                $scope.selectedSensor;

                $scope.selectSensor = function (selectedSensor) {
                    $scope.selectedSensor = selectedSensor;
                }

                $scope.addSensor = function () {
                    if ($scope.selectedSensor) {
                        var geosensor = $scope.geosensors.find(it => it.id == +$scope.selectedSensor);
                        var geometry = GeometryService.createGeometry($scope.image.id);
                        geometry.geosensor = geosensor;
                        console.log(geometry);
                        $scope.image.geometryList.push(geometry);
                        $scope.geosensors.splice($scope.geosensors.indexOf(geosensor), 1);
                    }
                }

                // dirty trick that solves the problem that the map is streched or sqeezed:
                // only after timeout openlayers can determine the dimensions available for the maps-canvas
                $timeout(() => {
                    ImageService.createOlImage($scope.image);
                });

                var image_width_px = $scope.image.image_width;
                var image_height_px = -$scope.image.image_height;

                var pixel_settings = {alias: 'pixel', name: 'Pixel'};

                var section_settings = {};
                if ($scope.image.geo_settings && ($scope.image.geo_settings.alias === 'section')) {
                    section_settings = $scope.image.geo_settings;
                } else {
                    section_settings = {
                        alias: 'section',
                        name: 'Section',
                        chainage_left: 0,
                        chainage_right: 999,
                        elevation_top: 100,
                        elevation_bottom: 0
                    };
                }

                var aerial_settings = {};
                if ($scope.image.geo_settings && ($scope.image.geo_settings.alias === 'aerial')) {
                    $scope.image.geo_settings.projection = $scope.image.geo_settings.projection || 'EPSG:4326';
                    aerial_settings = $scope.image.geo_settings;
                } else {
                    aerial_settings = {
                        alias: 'aerial',
                        name: 'Aerial',
                        projection: 'EPSG:4326',
                        easting_left: 11.11,
                        easting_right: 12.34,
                        northing_top: 53.0,
                        northing_bottom: 52.0
                    };
                }

                var geoModels = {
                    pixel: pixel_settings,
                    section: section_settings,
                    aerial: aerial_settings
                };

                $scope.selectableGeoModels = [{
                    id: 'pixel',
                    name: 'Pixel'
                }, {
                    id: 'section',
                    name: 'Section'
                }, {
                    id: 'aerial',
                    name: 'Aerial'
                }];

                $scope.selectedProjection = aerial_settings.projection;

                $scope.selectableProjections = [{
                    id: 'EPSG:4326',
                    name: 'EPSG:4326 - WGS84'
                }, {
                    id: 'EPSG:3857',
                    name: 'EPSG:3857 - WGS84 Web Mercator'
                }];

                for (var p in $scope.map_settings.value.projections) {
                    var proj = $scope.map_settings.value.projections[p];
                    if (proj.proj4) {
                        $scope.selectableProjections.push({
                            id: proj.defaults.alias,
                            name: proj.defaults.alias + (proj.name ? (" - " + proj.name) : "")
                        });
                    }
                }

                if ($scope.image.geo_settings) {
                    $scope.selectableGeoModels.forEach(function (model) {
                        if (model.id === $scope.image.geo_settings.alias) {
                            $scope.selectedGeoModel = model.id;
                        }
                    })
                } else {
                    $scope.selectedGeoModel = $scope.selectableGeoModels[0].id;
                    $scope.image.geo_settings = pixel_settings;
                }

                $scope.configmarkers = {
                    point_1_horizontal: {
                        projection: 'pixel',
                        coord: [image_width_px / 2, 0],
                        style: {
                            image: {
                                icon: {
                                    anchor: [0.5, 0.5],
                                    snapToPixel: true,
                                    src: iris.config.baseUrl + "/layouts/ui/img/marker-horizontal.png"
                                }
                            }
                        },
                        label: {
                            show: false
                        },
                        draggable: true
                    },
                    point_1_vertical: {
                        projection: 'pixel',
                        coord: [0, image_height_px / 2],
                        style: {
                            image: {
                                icon: {
                                    anchor: [0.5, 0.5],
                                    snapToPixel: true,
                                    src: iris.config.baseUrl + "/layouts/ui/img/marker-vertical.png"
                                }
                            }
                        },
                        label: {
                            show: false
                        },
                        draggable: true
                    },
                    point_2_horizontal: {
                        projection: 'pixel',
                        coord: [image_width_px / 2, image_height_px],
                        style: {
                            image: {
                                icon: {
                                    anchor: [0.5, 0.5],
                                    snapToPixel: true,
                                    src: iris.config.baseUrl + "/layouts/ui/img/marker-horizontal.png"
                                }
                            }
                        },
                        label: {
                            show: false
                        },
                        draggable: true
                    },
                    point_2_vertical: {
                        projection: 'pixel',
                        coord: [image_width_px, image_height_px / 2],
                        style: {
                            image: {
                                icon: {
                                    anchor: [0.5, 0.5],
                                    snapToPixel: true,
                                    src: iris.config.baseUrl + "/layouts/ui/img/marker-vertical.png"
                                }
                            }
                        },
                        label: {
                            show: false
                        },
                        draggable: true
                    }
                };

                $scope.configpoints = {
                    projection: aerial_settings.projection,
                    point_1: {
                        northing: aerial_settings.northing_top,
                        elevation: section_settings.elevation_top,
                        easting: aerial_settings.easting_left,
                        chainage: section_settings.chainage_left
                    },
                    point_2: {
                        northing: aerial_settings.northing_bottom,
                        elevation: section_settings.elevation_bottom,
                        easting: aerial_settings.easting_right,
                        chainage: section_settings.chainage_right
                    }
                };
                ImageService.updateImgMap();
            }

            $scope.$watch('configmarkers', function (newVal, oldVal) {
                if ($scope.image.geo_settings && $scope.configpoints) {
                    var point_1 = [Math.min($scope.configmarkers.point_1_vertical.coord[0], $scope.configmarkers.point_2_vertical.coord[0]),
                        Math.max($scope.configmarkers.point_1_horizontal.coord[1], $scope.configmarkers.point_2_horizontal.coord[1])];
                    var point_2 = [Math.max($scope.configmarkers.point_1_vertical.coord[0], $scope.configmarkers.point_2_vertical.coord[0]),
                        Math.min($scope.configmarkers.point_1_horizontal.coord[1], $scope.configmarkers.point_2_horizontal.coord[1])];
                    if ($scope.image.geo_settings.alias === 'section') {
                        var chainageAndElevation_1 = ImageHelpers.getXandYForPixelCoord(point_1, image_width_px, image_height_px, $scope.image.geo_settings);
                        $scope.configpoints.point_1.chainage = round(chainageAndElevation_1[0]);
                        $scope.configpoints.point_1.elevation = round(chainageAndElevation_1[1]);
                        var chainageAndElevation_2 = ImageHelpers.getXandYForPixelCoord(point_2, image_width_px, image_height_px, $scope.image.geo_settings);
                        $scope.configpoints.point_2.chainage = round(chainageAndElevation_2[0]);
                        $scope.configpoints.point_2.elevation = round(chainageAndElevation_2[1]);
                    } else if ($scope.image.geo_settings.alias === 'aerial') {
                        var geoSettings = angular.copy($scope.image.geo_settings);
                        if ($scope.configpoints.projection !== geoSettings.projection) {
                            var p1 = ol.proj.transform([geoSettings.easting_left, geoSettings.northing_top], geoSettings.projection, $scope.configpoints.projection);
                            var p2 = ol.proj.transform([geoSettings.easting_right, geoSettings.northing_bottom], geoSettings.projection, $scope.configpoints.projection);
                            geoSettings.projection = $scope.configpoints.projection;
                            geoSettings.easting_left = p1[0];
                            geoSettings.easting_right = p2[0];
                            geoSettings.northing_top = p1[1];
                            geoSettings.northing_bottom = p2[1];
                        }
                        var eastingAndNorthing_1 = ImageHelpers.getXandYForPixelCoord(point_1, image_width_px, image_height_px, geoSettings);
                        $scope.configpoints.point_1.easting = round(eastingAndNorthing_1[0]);
                        $scope.configpoints.point_1.northing = round(eastingAndNorthing_1[1]);
                        var eastingAndNorthing_2 = ImageHelpers.getXandYForPixelCoord(point_2, image_width_px, image_height_px, geoSettings);
                        $scope.configpoints.point_2.easting = round(eastingAndNorthing_2[0]);
                        $scope.configpoints.point_2.northing = round(eastingAndNorthing_2[1]);
                    }
                }
            }, true);

            $scope.geoModelSelected = function (selectedGeoModelId) {
                if (selectedGeoModelId) {
                    $scope.image.geo_settings = geoModels[selectedGeoModelId];
                    $scope.selectableGeoModels.forEach(function (model) {
                        if (model.id === selectedGeoModelId) {
                            $scope.selectedGeoModel = model;
                        }
                    })
                }
            };

            var round = function (value) {
                if ($scope.image.geo_settings.alias === 'aerial' && $scope.selectedProjection === 'EPSG:4326') {
                    // WSG84 one degree = 60 * 1852 meters = 111120 m -> 8 decimals almost as accurate as millimeter
                    return Math.round(value * 100000000) / 100000000;
                }
                else {
                    // units for other projections are meters -> 3 decimals are millimeters
                    return Math.round(value * 1000) / 1000;
                }
            }

            $scope.projectionSelected = function (selectedProjection) {
                if (selectedProjection && $scope.configpoints) {
                    var p1 = ol.proj.transform([$scope.configpoints.point_1.easting, $scope.configpoints.point_2.northing], $scope.configpoints.projection, selectedProjection);
                    var p2 = ol.proj.transform([$scope.configpoints.point_2.easting, $scope.configpoints.point_2.northing], $scope.configpoints.projection, selectedProjection);
                    $scope.configpoints.projection = selectedProjection;
                    $scope.selectedProjection = selectedProjection;
                    $scope.configpoints.point_1.easting = round(p1[0]);
                    $scope.configpoints.point_1.northing = round(p1[1]);
                    $scope.configpoints.point_2.easting = round(p2[0]);
                    $scope.configpoints.point_2.northing = round(p2[1]);
                }
            };

            $scope.checkAndUpdateGeoSetting = function () {
                if ($scope.image.geo_settings && $scope.image.geo_settings.alias !== 'pixel') {
                    $scope.image.geo_type = $scope.image.geo_settings.alias;
                    var point_1 = [Math.min($scope.configmarkers.point_1_vertical.coord[0], $scope.configmarkers.point_2_vertical.coord[0]),
                        Math.max($scope.configmarkers.point_1_horizontal.coord[1], $scope.configmarkers.point_2_horizontal.coord[1])];
                    var point_2 = [Math.max($scope.configmarkers.point_1_vertical.coord[0], $scope.configmarkers.point_2_vertical.coord[0]),
                        Math.min($scope.configmarkers.point_1_horizontal.coord[1], $scope.configmarkers.point_2_horizontal.coord[1])];

                    var width_px = point_2[0] - point_1[0];
                    var height_px = point_2[1] - point_1[1];

                    var width_val = $scope.configpoints.point_2.chainage - $scope.configpoints.point_1.chainage;
                    var height_val = $scope.configpoints.point_2.elevation - $scope.configpoints.point_1.elevation;

                    if ($scope.image.geo_settings.alias === 'section') {
                        $scope.image.geo_settings.chainage_left = $scope.configpoints.point_1.chainage - (width_val / width_px) * point_1[0];
                        $scope.image.geo_settings.chainage_right = $scope.configpoints.point_2.chainage + (width_val / width_px) * (image_width_px - point_2[0]);
                        $scope.image.geo_settings.elevation_top = $scope.configpoints.point_1.elevation - (height_val / height_px) * point_1[1];
                        $scope.image.geo_settings.elevation_bottom = $scope.configpoints.point_2.elevation + (height_val / height_px) * (image_height_px - point_2[1]);
                    } else if ($scope.image.geo_settings.alias === 'aerial') {
                        $scope.image.geo_settings.projection = $scope.configpoints.projection;
                        $scope.image.geo_settings.easting_left = $scope.configpoints.point_1.easting - (width_val / width_px) * point_1[0];
                        $scope.image.geo_settings.easting_right = $scope.configpoints.point_2.easting + (width_val / width_px) * (image_width_px - point_2[0]);
                        $scope.image.geo_settings.northing_top = $scope.configpoints.point_1.northing - (height_val / height_px) * point_1[1];
                        $scope.image.geo_settings.northing_bottom = $scope.configpoints.point_2.northing + (height_val / height_px) * (image_height_px - point_2[1]);
                    }
                } else {
                    $scope.image.geo_type = 'pixel';
                }
            }

            $scope.changeVisibilityForAll = function (rows) {
                rows.forEach(row => {
                    doChangeVisibility(row.entity, row.isSelected, false);
                })
            }

            function doChangeVisibility(geometry, visible, zoom) {

                geometry.visible = visible;
                if (visible) {
                    var coord;
                    if (geometry.marker) {
                        coord = geometry.marker.coord;
                    } else {
                        coord = angular.copy((geometry.coordinates && geometry.coordinates.length) ? geometry.coordinates : $scope.image.ol.center.coord);
                        geometry.marker = {
                            projection: "pixel",
                            coord: coord,
                            style: geometry.geosensor.geosensorType.style,
                            label: {
                                show: false,
                                showOnMouseOver: true,
                                message: geometry.geosensor.sensor.name
                            },
                            draggable: true
                        };
                    }
                    $scope.image.ol.center.coord = coord;
                    if (zoom) {
                        $scope.image.ol.center.zoom++;
                    }
                }
            }

            $scope.changeVisibility = function (geometry, visible, zoom) {
                doChangeVisibility(geometry, visible, zoom);
            }

            $scope.changeMarkerLabelVisibility = function (geometry) {
                if (geometry.marker && geometry.marker.label) {
                    geometry.marker.label.show = !geometry.marker.label.show;
                    geometry.marker.label.showOnMouseOver = !geometry.marker.label.show;
                }
            }

            $scope.gridSensorsOptions = {
                data: 'image.geometryList',
                enableSelectAll: true,
                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'ID',
                        width: 30
                    },
                    {
                        field: 'geosensor.sensor.name',
                        displayName: $translate.instant('label.SensorName'),
                        width: 210
                    },
                    {
                        field: 'geosensor.geosensorType.name',
                        width: 90,
                        displayName: $translate.instant('label.SensorType')
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Label'),
                        width: 50,
                        enableSorting: false,
                        cellTemplate: `
                    <div class="ui-grid-cell-contents actions">
                        <button ng-if="row.entity.marker"
                                class="btn btn-default"
                                ng-click="grid.appScope.changeMarkerLabelVisibility(row.entity)" uib-tooltip="{{\'label.Visualization\' | translate}}">
                            <i class="fa" ng-class="{'fa-eye': row.entity.marker.label.show, 'fa-eye-slash': !row.entity.marker.label.show}" ></i>
                        </button>
                    </div>`
                    }
                ],

                onRegisterApi: function (gridApi) {
                    $scope.gridSensorsOptions.gridApi = gridApi;

                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows, event) {
                        $scope.changeVisibilityForAll(rows);
                    });

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        $scope.changeVisibility(row.entity, row.isSelected, true);
                    });
                }
            };

            $scope.back = function () {
                $state.go('module.images.images');
            }

            function prepareGeometriesForSaving() {
                $scope.image.geometryList.forEach(geometry => {
                    geometry.type = "Point";
                    geometry.coordinates = geometry.marker.coord;
                    geometry.geosensor_id = geometry.geosensor.id;
                })
            }

            $scope.saveItem = function () {
                $scope.checkAndUpdateGeoSetting();
                prepareGeometriesForSaving();
                ImageService.saveImage($scope.image).then(function (result) {
                    alertify.success($translate.instant('message.ImageSaved'));
                    $scope.back();
                });
            };
        });

})();