(function () {
    angular.module('iris_maps_layers_manager', []);

    angular.module('iris_maps_layers_manager').directive('irisProjectLayers',
        function ($filter, LayersService, MapService) {
            return {
                restrict: 'EA',
                scope: {
                    project_id: '=project',
                    lg: '=layerGroup'
                },
                templateUrl: iris.config.componentsUrl + '/layers-manager/iris-maps-layers.html',
                link: function (scope, element, attrs) {
                    scope.bg_layers = LayersService.getLayers();
                    scope.map_settings = MapService.getMapSettings();
                }
            };
        });

    angular.module('iris_maps_layers_manager').directive('irisLayer',
        function ($filter, $timeout, $translate,
                  LayersService, MapService, DevicesService, MarkersService, irisPermalink, SecurityService, LayersManagerService) {
            return {
                restrict: 'EA',
                scope: {
                    layer: '=',
                    lg: '=layerGroup'
                },
                templateUrl: iris.config.componentsUrl + '/layers-manager/iris-maps-layer.html',
                link: function (scope, element, attrs) {
                    scope.show_markers = attrs.showMarkers != "false";
                    scope.map_settings = MapService.getMapSettings();
                    scope.devices = DevicesService.getDevices();

                    scope.toggleLayerSelected = function (layer) {
                        LayersManagerService.toggleLayerSelected(layer);
                    };

                    scope.removeLayer = function (layer) {
                        alertify.confirm($translate.instant('text.maps.LayerRemoveConfirm'), function (e) {
                            if (e) {
                                // Deselect layer to remove object from map (ol)
                                if (layer.selected) LayersManagerService.toggleLayerSelected(layer);

                                LayersService.removeLayer(layer).then(function () {
                                    alertify.success($translate.instant('text.maps.LayerRemoved'));
                                });
                            }
                        });
                    };

                    scope.toggleFavorite = function (layer) {
                        LayersService.toggleFavorite(layer);
                    };

                    scope.zoomToLayer = function(layer) {
                        MapService.zoomToLayer(layer);
                    };

                    scope.zoomToMarker = function(marker) {
                        MapService.setCenter(marker.position.lat, marker.position.lon, 20);
                    };

                    scope.moveLayer = function (evt, layer, delta) {
                        LayersService.moveLayer(evt, layer, delta);
                    };

                    scope.removeMarker = function (m) {
                        MarkersService.removeMarker(m);
                    };

                    scope.toggleMarkerSelected = function (marker, is_init) {
                        MarkersService.toggleMarkerSelected(marker);
                        if (!is_init) irisPermalink.updateParams({markers: MarkersService.getSelectedIds().join(',')});
                    };

                    scope.hasPermission = function () {
                        return SecurityService.hasPermissions('MAPS', 'Module', 'config');
                    };

                    scope.openEditMarkerModal = function (markerId, layerId) {
                        var position = scope.map_settings.settings.center;
                        var src_marker = markerId ? MarkersService.getMarkerById(markerId) : null;

                        var was_selected = (src_marker && src_marker.selected);

                        MarkersService.openEditMarkerModal(markerId, position, layerId).then(marker => {
                            // if marker was selected - select it again
                            if (was_selected) {
                                MarkersService.toggleMarkerSelected(src_marker);
                                $timeout(() => {
                                    angular.extend(src_marker, marker);
                                    MarkersService.toggleMarkerSelected(src_marker);
                                });
                            }
                        }, () => {
                            if (was_selected && !src_marker.selected) MarkersService.toggleMarkerSelected(src_marker);
                        })
                    }
                }
            };
        });

    angular.module('iris_maps_layers_manager').directive('irisMapsProjects',
        function ($filter, ProjectsService, LayersService, SecurityService, LayersManagerService) {
            return {
                restrict: 'EA',
                scope: {
                    bg_layers: '=layers',
                    lg: '=layerGroup',
                    selected_project_id: '=project'
                },
                templateUrl: iris.config.componentsUrl + '/layers-manager/iris-maps-projects.html',
                link: function (scope, element, attrs) {
                    scope.setProjects = function (project_id) {
                        if (project_id > 0) {
                            scope.projects = [];
                            scope.projects.push(ProjectsService.getById(project_id));
                        } else {
                            scope.projects = $filter('filter')(ProjectsService.getProjects(), {projectId: null}, true);
                        }
                    };

                    ProjectsService.getProjects().$promise.then(function () {
                        scope.setProjects(scope.selected_project_id);
                        //scope.projects = ProjectsService.getProjects();
                        for (var i = 0, c = scope.projects.length; i < c; i++) {

                            scope.projects[i].is_collapsed = scope.projects[i].is_collapsed || false;
                            for (var j = 0, cc = scope.projects[i].projects.length; j < cc; j++) {
                                scope.projects[i].projects[j].is_collapsed = scope.projects[i].projects[j].is_collapsed || false;
                            }
                        }
                    });

                    scope.$watch('selected_project_id', function (nv, ov) {
                        if (nv == ov) return;

                        scope.setProjects(nv);
                    }, true);

                    scope.toggleLayersByProject = function (project_id, final_state) {
                        var layers = LayersService.filter({project_id: project_id});
                        for (var i = 0, c = layers.length; i < c; i++) {
                            if (layers[i].selected && !final_state || !layers[i].selected && final_state) LayersManagerService.toggleLayerSelected(layers[i]);
                        }
                        var project = ProjectsService.getById(project_id);
                        for (i = 0, c = project.projects.length; i < c; i++) {
                            scope.toggleLayersByProject(project.projects[i].id, final_state);
                        }
                    };

                    scope.hasPermission = function () {
                        return SecurityService.hasPermissions('MAPS', 'Module', 'config');
                    };

                }
            };
        });

    angular.module('iris_maps_layers_manager').factory('LayersManagerService', function ($filter, $timeout, LayersService, irisPermalink, MarkersService, MapService) {
        return {
            toggleLayerSelected: function (layer, is_init, filter_marker_ids) {
                if(!layer) return;
                is_init = is_init || false;
                var ol_layers = LayersService.getOlLayers();
                var selected_layers_ids = LayersService.getSelectedLayersIds();

                if (layer.selected) {
                    var index = $filter('IrisFilterIndex')(ol_layers, {id: [layer.id]});
                    if (index != null) {
                        ol_layers.splice(index, 1);
                    }
                    selected_layers_ids.splice(selected_layers_ids.indexOf(layer.id), 1);
                    layer.selected = false;
                    layer.markers.forEach(marker => {
                        if (marker.selected) {
                            MarkersService.toggleMarkerSelected(marker);
                        }
                    });
                } else {
                    iris.loader.start();
                    if (!layer.ol) LayersService.createOlLayer(layer, this.toggleLayerSelected);

                    // If OL layer still not created - don't mark layer as selected
                    if (!layer.ol) {
                        iris.loader.stop();
                        return;
                    }
                    layer.markers.forEach(marker => {
                        if (!marker.selected && (!filter_marker_ids || filter_marker_ids.indexOf(marker.id) != -1)) {
                            MarkersService.toggleMarkerSelected(marker);
                        }
                    });
                    ol_layers.push(layer);
                    selected_layers_ids.push(layer.id);
                    layer.selected = true;
                    iris.loader.stop();
                    $timeout(function () {
                        layer.order = MapService.getOlLayerIndex(layer.id);
                    });
                }

                if (!is_init) irisPermalink.updateParams({layers: selected_layers_ids.join(',')});
                return layer;
            }
        }

    });


    angular.module('iris_maps_layers_manager').factory('LayersAerialImagesService',
        function ($q, Images) {

            var project_aerial_images = [];
            var current_project_id;

            function getProjectAerialImages(company) {
                company.aerial_images = [];
                var projectId = company.selected_project_id;
                if (projectId && (!current_project_id || current_project_id !== projectId)) {
                    project_aerial_images.clear;
                    Images.getByProjectIdAndGeoType({
                        project_id: projectId,
                        geo_type: 'aerial'
                    }).$promise.then(result => {
                        result.forEach(image => {
                            if (image.geo_settings) {
                                var projection = image.geo_settings.projection;
                                var proj4projection = proj4.defs[projection];
                                if (proj4projection) {
                                    console.log(proj4projection);
                                    company.aerial_images.push(image);
                                    project_aerial_images.push(image);
                                }
                            }
                        });
                    });
                    current_project_id = projectId;
                } else {
                    company.aerial_images.push(project_aerial_images);
                }
            }

            return {
                getProjectAerialImages
            }
        });

    angular.module('iris_maps_layers_manager').factory('LayersGeoDataService',
        function ($q, IrisNaviViewService, ProjectDeviceGeoData, DevicesService) {
            var projectDevices = [];

            function getDevicePosition(projectId, deviceId) {
                return ProjectDeviceGeoData.getPosition({
                    project_id: projectId,
                    id: deviceId
                }).$promise;
            }

            function getProjectDeviceAlignment(projectId, deviceId) {
                return ProjectDeviceGeoData.getAlignment({
                    project_id: projectId,
                    id: deviceId
                }).$promise;
            }

            function getProjectDeviceProperty(projectId, deviceId, field) {
                var targetPD = projectDevices.filter(pd => pd.project_id == projectId && pd.device_id == deviceId)[0];
                return targetPD ? targetPD[field] : null;
            }

            function resetUsedProjectDevices(bg_layers) {
                // filter only tbm and tunnel layers to register data updates
                projectDevices = bg_layers.reduce((result, layer) => {
                    var pd = {
                        project_id: layer.project_id,
                        device_id: layer.device_id
                    };
                    if (result.indexOf(pd) < 0) result.push(pd);
                    return result;
                }, []);

                return updateGeoData(bg_layers);
            }

            function updateGeoData(bg_layers) {
                var geoData = $q.defer();

                var promises = [];

                projectDevices.forEach(projectDevice => {
                    // NaviView Device latest position
                    promises.push(IrisNaviViewService.requestModel(projectDevice).$promise);

                    // NaviView ProjectDevice boundaries
                    promises.push(IrisNaviViewService.requestBoundaries(projectDevice).$promise);

                    // Device position
                    promises.push(getDevicePosition(projectDevice.project_id, projectDevice.device_id));

                    // Device status
                    promises.push(DevicesService.getDeviceState(projectDevice.project_id, projectDevice.device_id));

                    // Device Alignment, we get it only once and never autoreload
                    if(!projectDevice.alignment) {
                        promises.push(getProjectDeviceAlignment(projectDevice.project_id, projectDevice.device_id))
                    } else {
                        promises.push($q.when());
                    }
                });

                $q.all(promises).then(results => {
                    var i = 0;
                    projectDevices.forEach(projectDevice => {
                        projectDevice.navi_data = results[i++];
                        projectDevice.boundaries = results[i++];
                        projectDevice.position = results[i++];
                        projectDevice.deviceState = results[i++];

                        if(!projectDevice.alignment) {
                            projectDevice.alignment = results[i++]
                        } else {
                            i++;
                        }
                    });

                    //update info for each layer by it's project and device id's
                    bg_layers.forEach(layer => {
                        var projectId = layer.project_id;
                        var deviceId = layer.settings.device_id;

                        layer.navi_data = getProjectDeviceProperty(projectId, deviceId, 'navi_data');
                        layer.boundaries = getProjectDeviceProperty(projectId, deviceId, 'boundaries');
                        layer.position = getProjectDeviceProperty(projectId, deviceId, 'position');
                        layer.deviceState = getProjectDeviceProperty(projectId, deviceId, 'deviceState');
                        layer.alignment = getProjectDeviceProperty(projectId, deviceId, 'alignment');
                    });

                    geoData.resolve(geoData);
                });

                return geoData.promise;
            }

            return {
                getDevicePosition,

                getProjectDeviceAlignment,

                resetUsedProjectDevices,

                updateGeoData
            }
        });
})();
