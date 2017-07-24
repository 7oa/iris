(function () {
    angular.module('iris_maps_markers', ['iris_maps_markers_controllers']);

    angular.module('iris_maps_markers').factory('Markers', function ($resource) {
        return $resource(iris.config.apiUrl + "/maps/layers/:layer_id/markers/:id", {
            id: '@id',
            layer_id: '@layer_id'
        });
    });

    angular.module('iris_maps_markers').factory('MarkersService',
        function ($filter, $translate, $uibModal, Markers, LayersService, SensorMarkerHelpers) {

            var selected_markers_ids = [];

            return {
                createMarker: function (position, layer_id) {
                    layer_id = layer_id || null;
                    return new Markers({
                        layer_id: layer_id,
                        settings: {
                            marker_type: 'default',
                            label_type: 'default',
                            label: {}
                        },
                        position: {
                            lon: position.lon,
                            lat: position.lat,
                            projection: position.projection
                        },
                        style: {
                            image: {
                                icon: {
                                    anchor: [0.5, 1.0]
                                }
                            }
                        }
                    })
                },

                getMarkerById: function (markerId, layers) {
                    var marker = null;
                    layers = layers || LayersService.getLayers();

                    for (var layer of layers) {
                        layer.markers = layer.markers || [];
                        var filteredMarkers = layer.markers.filter(marker => marker.id == markerId);
                        if (filteredMarkers.length) {
                            marker = filteredMarkers[0];
                            break;
                        }
                    }
                    return marker;
                },

                saveMarker: function (marker) {
                    if (!marker.layer_id) return;

                    var is_new = !angular.isDefined(marker.id);
                    var layer = LayersService.getLayerById(marker.layer_id);

                    return Markers.save(marker).$promise.then(marker => {
                        if (is_new) {
                            layer.markers.push(marker);
                            this.toggleMarkerSelected(marker);
                        }
                        return marker;
                    });
                },

                getSelectedIds: function () {
                    return selected_markers_ids;
                },

                toggleMarkerSelected: function (marker) {
                    if (!marker) return;
                    var isNumber = !isNaN(parseInt(marker.id));
                    if (marker.selected) {
                        if (isNumber) {
                            selected_markers_ids.splice(selected_markers_ids.indexOf(marker.id), 1);
                        }
                        marker.selected = false;
                    } else {
                        this.createOlMarker(marker);
                        marker.selected = true;
                        if (isNumber) {
                            selected_markers_ids.push(marker.id);
                        }
                    }
                },

                createOlMarker: function (marker) {
                    marker.ol = {};
                    marker.ol.visible = true;
                    angular.extend(marker.ol, marker.position);
                    angular.extend(marker.ol, {
                        label: marker.settings.label
                    });
                    angular.extend(marker.ol, {
                        style: marker.style
                    });
                    angular.extend(marker.ol, {
                        name: marker.name,
                        id: marker.id,
                        description: marker.description
                    });
                    marker.ol.icon = 'fa-map-marker';
                    marker.ol.icon_css_class = 'text-success';

                    marker.ol.label.showOnMouseClick = true;
                    marker.ol.label.show = false;
                    marker.ol.label.type = marker.settings.label_type;

                    if (!marker.ol.label.message) {
                        marker.ol.label.message = marker.name;
                    }

                    if (marker.settings.marker_type === 'default') {
                        delete marker.ol.style;
                    }
                    if (marker.settings.label_type === 'sensor' || marker.settings.label_type === 'sensorgroup') {
                        SensorMarkerHelpers.loadSensorAndSensorGroupsForMarker(marker);
                    }

                    // angular.extend(marker.ol, marker.settings.view);
                    marker.toggleMarkerSelected = function () {
                        this.toggleMarkerSelected(marker);
                    }
                },

                openEditMarkerModal: function (markerId, position, layerId) {
                    return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + "/markers/templates/marker.edit.modal.html",
                        resolve: {
                            'layers': function (LayersService) {
                                return LayersService.getLayers()
                                    .filter(layer => layer.type == 'points')
                                    .map(layer => {
                                        return {
                                            id: layer.id,
                                            name: layer.name,
                                            type: layer.type,
                                            project_id: layer.project_id
                                        }
                                    })
                            },
                            'marker': function (LayersService, MarkersService) {
                                if (markerId) {
                                    return MarkersService.getMarkerById(+markerId, LayersService.getLayers());
                                } else {
                                    return MarkersService.createMarker(position, layerId);
                                }
                            },
                            'folders': function (FoldersService) {
                                return FoldersService.requestFolders().$promise.then(folders => folders);
                            },
                            'projects': function(ProjectsService, irisPermalink) {
                                var projectId = irisPermalink.getParams().project;
                                // selected project and subprojects
                                return ProjectsService.getProjects().$promise.then(data => data
                                    .filter(project => (projectId && (project.id == projectId || project.projectId == projectId))));
                            }
                        },
                        controller: 'MarkerEditCtrl',
                        size: 'lg'
                    }).result;
                },

                removeMarker: function (marker) {
                    var layer = LayersService.getLayerById(marker.layer_id);
                    Markers.remove({id: marker.id, layer_id: marker.layer_id}).$promise.then(function (value) {
                        for (var i in layer.markers) {
                            if (layer.markers[i].id == value.id) {
                                layer.markers.splice(i, 1);
                                break;
                            }
                        }
                        alertify.success($translate.instant('label.maps.MarkerRemovedSuccessfully'))
                    })
                }
            };
        });

    angular.module('iris_maps_markers').factory('MarkerHelpers', function () {
        var marker_types = [{
            type: 'default',
            name: 'Default',
            default: {
                image: {
                    icon: {
                        anchor: [0.5, 1.0]
                    }
                }
            }
        }, {
            type: 'document',
            name: 'Document',
            default: {
                text: {
                    font: '25px FontAwesome',
                    fill: {
                        color: '#FFFFFF'
                    },
                    stroke: {
                        color: '#000000',
                        width: 2
                    },
                    text: '\uf15b'
                }
            }
        }, {
            type: 'sensor',
            name: 'Sensor',
            default: {
                image: {
                    circle: {
                        radius: 20,
                        fill: {
                            color: '#FFFFFF'
                        },
                        stroke: {
                            color: '#FFFFFF',
                            width: 2
                        }
                    }
                },
                text: {
                    font: '25px FontAwesome',
                    fill: {
                        color: '#FFFFFF'
                    },
                    stroke: {
                        color: '#000000',
                        width: 2
                    },
                    text: 'S'
                }
            }
        }, {
            type: 'sensorgroup',
            name: 'Sensor Group',
            default: {
                image: {
                    circle: {
                        radius: 20,
                        fill: {
                            color: '#FFFFFF'
                        },
                        stroke: {
                            color: '#FFFFFF',
                            width: 2
                        }
                    }
                },
                text: {
                    font: '25px FontAwesome',
                    fill: {
                        color: '#FFFFFF'
                    },
                    stroke: {
                        color: '#000000',
                        width: 2
                    },
                    text: 'G'
                }
            }
        }, {
            type: 'image',
            name: 'Image',
            default: {
                image: {
                    icon: {
                        anchor: [0.5, 1.0],
                        src: 'http://www.itc-engineering.de/fileadmin/templates/pic/logo.png'
                    }
                }
            }
        }, {
            type: 'circle',
            name: 'Circle',
            default: {
                image: {
                    circle: {
                        radius: 20,
                        fill: {
                            color: '#FFFFFF'
                        },
                        stroke: {
                            color: '#000000',
                            width: 2
                        }
                    }
                }
            }
        }, {
            type: 'shape',
            name: 'Shape',
            default: {
                image: {
                    regularshape: {
                        radius: 20,
                        points: 4,
                        fill: {
                            color: '#FFFFFF'
                        },
                        stroke: {
                            width: 3,
                            color: '#000000'
                        }
                    }
                }
            }
        }, {
            type: 'text',
            name: 'Text',
            default: {
                text: {
                    font: '25px FontAwesome',
                    fill: {
                        color: '#FFFFFF'
                    },
                    stroke: {
                        color: '#000000',
                        width: 2
                    },
                    text: 'text',
                    rotation: 0
                }
            }
        }];

        var marker_label_types = [{
            type: 'html',
            name: 'HTML',
            default: {
                message: ''
            }
        }, {
            type: 'text',
            name: 'Text',
            default: {
                message: ''
            }
        }, {
            type: 'url',
            name: 'Url',
            default: {
                url: '',
                caption: ''
            }
        }, {
            type: 'default',
            name: 'Default',
            default: {}
        }, {
            type: 'document',
            name: 'Document',
            default: {
                documents: []
            }
        }, {
            type: 'sensor',
            name: 'Sensor',
            default: {
                sensor: {}
            }
        }, {
            type: 'sensorgroup',
            name: 'Sensor Group',
            default: {
                sensorgroup: {}
            }
        }];

        return {
            getMarkersTypes: function () {
                return marker_types;
            },

            getMarkersLabelTypes: function () {
                return marker_label_types;
            }
        }
    })


    angular.module('iris_maps_markers').factory('SensorMarkerHelpers', function ($q, SensorGroupsService, SensorsService, DataSeriesService) {

        var getDsIDsForLayer = function (layer) {
            var ds_ids = [];
            layer.markers.forEach(marker => {
                if (marker.selected) {
                    addDsIDsForMarker(marker, ds_ids);
                }
            });
            return ds_ids;
        }

        var addDsIDsForMarker = function (marker, ds_ids) {
            if (marker.ol.label.sensorgroup && marker.ol.label.sensorgroup.sensors) {
                marker.ol.label.sensorgroup.sensors.forEach(sensor => {
                    if (sensor.dataseries) {
                        sensor.dataseries.forEach(ds => {
                            ds_ids.push({dataSeriesId: ds.id});
                        });
                    }
                });
            } else if (marker.ol.label.sensor && marker.ol.label.sensor.dataseries) {
                marker.ol.label.sensor.dataseries.forEach(ds => {
                    ds_ids.push({dataSeriesId: ds.id});
                });
            }
        }

        var loadLatestDsValuesForLayer = function (layer) {
            var ds_ids = getDsIDsForLayer(layer);
            if (ds_ids.length) {
                DataSeriesService.getValues({
                    dataseries: angular.toJson(ds_ids),
                    'only-last': true,
                    'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}])
                }).then(result  => {
                    layer.markers.forEach(marker => {
                        if (marker.selected) {
                            writeDsValuesToMarker(marker, result);
                        }
                    });
                });
            }
        }

        var writeDsValuesToMarker = function (marker, result) {
            var alarmLevel = -1;
            if (marker.ol.label.sensorgroup && marker.ol.label.sensorgroup.sensors) {
                marker.ol.label.sensorgroup.sensors.forEach(sensor => {
                    if (sensor.dataseries) {
                        var sensorAlarm = writeDsValuesToSensor(sensor, result);
                        if (sensorAlarm > alarmLevel) {
                            alarmLevel = sensorAlarm;
                        }
                    }
                });
            } else if (marker.ol.label.sensor && marker.ol.label.sensor.dataseries) {
                var sensorAlarm = writeDsValuesToSensor(marker.ol.label.sensor, result);
                if (sensorAlarm > alarmLevel) {
                    alarmLevel = sensorAlarm;
                }
            }
            setMarkerColorForAlarmlevel(marker, alarmLevel);
        }

        var writeDsValuesToSensor = function (sensor, result) {
            var alarmLevel = -1;
            if (sensor.dataseries.length) {
                sensor.dataseries.forEach(ds => {
                    if (result[ds.id]) {
                        ds.value = result[ds.id].pop();

                        // intermediate solution while alarming is not yet available
                        if (ds.systemIndexName.endsWith("ALARM") && ds.value) {
                            if (ds.value.value > alarmLevel) {
                                alarmLevel = ds.value.value;
                            }
                        }
                    }
                });
            }
            return alarmLevel;
        }

        var setMarkerColorForAlarmlevel = function (marker, alarmLevel) {

            if (alarmLevel > -1 && marker.ol.style.text) {
                switch (alarmLevel) {
                    case 0:
                        marker.ol.style.text.fill.color = '#00EE00';
                        break;
                    case 1:
                        marker.ol.style.text.fill.color = '#EEEE00';
                        break;
                    case 2:
                        marker.ol.style.text.fill.color = '#EE0000';
                        break;
                }
            }
        }

        var loadSensorForMarker = function (sensor) {
            DataSeriesService.getDSbySensor(sensor.id).$promise.then(result => {
                sensor.dataseries = [];
                result.forEach(ds => {
                    sensor.dataseries.push(ds);
                });
            });
        }

        var loadSensorGroupForMarker = function (group) {
            SensorGroupsService.getSensorGroup(group.device, group.id).then(result => {
                group.sensors = [];
                result.sensors.forEach(sensor => {
                    group.sensors.push(sensor);
                    loadSensorForMarker(sensor);
                });
            });
        }

        var loadSensorAndSensorGroupsForMarker = function (marker) {
            if (marker.ol && marker.ol.label.sensorgroup && marker.ol.label.sensorgroup.id) {
                loadSensorGroupForMarker(marker.ol.label.sensorgroup);
            } else if (marker.ol && marker.ol.label.sensor && marker.ol.label.sensor.id) {
                loadSensorForMarker(marker.ol.label.sensor);
            }
        }

        return {

            updateMarkerLatestDataseriesValuesForLayer: function (layer) {
                loadLatestDsValuesForLayer(layer);
            },

            loadSensorAndSensorGroupsForMarker: function (marker) {
                loadSensorAndSensorGroupsForMarker(marker);
            }
        }

    })

})();
