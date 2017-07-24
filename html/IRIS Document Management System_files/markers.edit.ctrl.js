(function () {
    angular.module('iris_maps_markers_controllers', []);

    angular.module('iris_maps_markers_controllers').controller('MarkerEditCtrl',
        function ($scope, $q, $uibModalInstance, marker, layers, projects, folders,
                  MarkersService, MarkerHelpers, FilesService, DevicesService, SensorGroupsService) {

            $scope.marker = marker;
            $scope.projects = projects;

            $scope.layers = [];
            layers.forEach(function (layer) {
                if (!$scope.projects.length && !layer.project_id) {
                    // company view
                    $scope.layers.push(layer);
                } else {
                    $scope.projects.forEach(project => {
                        // filter layers for selected projects
                        if (layer.project_id == project.id) {
                            $scope.layers.push(layer);
                            return;
                        }
                    });
                }
            });

            /* when selected layer was changed, it is possible that the project also changed
             * -> then sensors and documents selection must be reset
             */
            $scope.projectForSelectedLayer = {devices: []};
            var selectProjectForLayerId = function (layerId, is_init) {
                if (layerId) {
                    $scope.layers.forEach(layer => {
                        if (layer.id == layerId) {
                            selectProjectForLayer(layer, is_init);
                        }
                    });
                }
            }
            var selectProjectForLayer = function (layer, is_init) {
                $scope.projects.forEach(project => {
                    if (layer.project_id == project.id) {
                        if (is_init) {
                            $scope.projectForSelectedLayer = project;
                        } else if ($scope.projectForSelectedLayer.id != project.id) {
                            $scope.projectForSelectedLayer = project;
                            if (!is_init) {
                                resetSensorSelection();
                                resetDocumentsSelection();
                                resetMarkerLabelSettings();
                            }
                        }
                    }
                });
            }
            selectProjectForLayerId($scope.marker.layer_id, true);

            $scope.selectLayer = function (layerId) {
                selectProjectForLayerId($scope.marker.layer_id, false);
            }

            $scope.marker_types = MarkerHelpers.getMarkersTypes();
            $scope.marker_label_types = MarkerHelpers.getMarkersLabelTypes();

            var degreesToRadians = function (deg) {
                return deg ? ( deg * Math.PI / 180) : 0;
            };
            var radiansToDegrees = function (rad) {
                return rad ? (rad * 180 / Math.PI) : 0;
            };

            $scope.saveMarker = function () {
                if ($scope.marker.settings.ui) {
                    if ($scope.marker.style.image && $scope.marker.style.image.shape) {
                        $scope.marker.style.image.shape.rotation = degreesToRadians($scope.marker.settings.ui.rotation_degrees_for_shape);
                    }
                    if ($scope.marker.style.text) {
                        $scope.marker.style.text.rotation = degreesToRadians($scope.marker.settings.ui.rotation_degrees_for_text);
                    }
                    delete $scope.marker.settings.ui;
                }
                if ($scope.marker.settings.label_type === 'sensor') {
                    $scope.marker.settings.label.sensor = {
                        id: $scope.selected_sensor.id,
                        device: $scope.selected_device.id
                    };
                    if ($scope.selected_sensorgroup) {
                        $scope.marker.settings.label.sensor.group = $scope.selected_sensorgroup.id;
                    }
                } else if ($scope.marker.settings.label_type === 'sensorgroup') {
                    $scope.marker.settings.label.sensorgroup = {
                        id: $scope.selected_sensorgroup.id,
                        device: $scope.selected_device.id
                    };
                }
                iris.loader.start('.modal-body');
                MarkersService.saveMarker(marker).then(function (marker) {
                    /* save marker-reference to document's properties
                     * (currently only one marker-reference can be saved to each document) */
                    if (marker.settings.label.documents && marker.settings.label.documents.length) {
                        marker.settings.label.documents.forEach(d => {
                            d.layerId = marker.layer_id;
                            d.markerId = marker.id;
                            FilesService.saveFileInfo(d);
                        })
                    }
                    /* remove marker-reference from documents that have been removed from marker */
                    if (attachedDocumentsBeforeEditing.length) {
                        attachedDocumentsBeforeEditing.forEach(d => {
                            if (getMarkerFileIndex(d) == -1) {
                                console.log("removing marker-information from file " + d.name);
                                delete d.markerId;
                                delete d.layerId;
                                FilesService.saveFileInfo(d);
                            }
                        })
                    }
                    iris.loader.stop('.modal-body');
                    $scope.$close(marker);
                });
            };

            var previousStyleSettings = {};

            $scope.$watch('marker.settings.marker_type', function (newValue, oldValue) {
                for (var i in $scope.marker_types) {
                    if ($scope.marker_types[i].type == $scope.marker.settings.marker_type) {
                        if (oldValue && $scope.marker.style) {
                            previousStyleSettings[oldValue] = $scope.marker.style;
                        }
                        $scope.marker.style = {};
                        if (previousStyleSettings[$scope.marker.settings.marker_type]) {
                            $scope.marker.style = previousStyleSettings[$scope.marker.settings.marker_type];
                        } else {
                            $scope.marker.style = angular.copy($scope.marker_types[i].default);
                        }
                        $scope.marker.settings.ui = {};
                        if ($scope.marker.style.image && $scope.marker.style.image.regularshape) {
                            $scope.marker.settings.ui.rotation_degrees_for_shape = radiansToDegrees($scope.marker.style.image.regularshape.rotation);
                        }
                        if ($scope.marker.style.text) {
                            $scope.marker.settings.ui.rotation_degrees_for_text = radiansToDegrees($scope.marker.style.text.rotation);
                        }
                    }
                }
            });

            var previousLabelSettings = {};

            $scope.$watch('marker.settings.label_type', function (newValue, oldValue) {
                for (var i in $scope.marker_label_types) {
                    if ($scope.marker_label_types[i].type == $scope.marker.settings.label_type) {
                        if (oldValue && $scope.marker.settings.label) {
                            previousLabelSettings[oldValue] = $scope.marker.settings.label;
                        }
                        $scope.marker.settings.label = {};
                        if (previousLabelSettings[$scope.marker.settings.label_type]) {
                            $scope.marker.settings.label = previousLabelSettings[$scope.marker.settings.label_type];
                        } else {
                            $scope.marker.settings.label = angular.copy($scope.marker_label_types[i].default);
                        }
                    }
                }
            });

            $scope.marker.settings = $scope.marker.settings || [];

            var resetMarkerLabelSettings = function() {
                angular.extend($scope.marker.settings.label, {
                    documents: $scope.marker.settings.label.documents || [],
                    sensor: $scope.marker.settings.label.sensor || {},
                    sensorgroup: $scope.marker.settings.label.sensorgroup || {}
                });
            }
            resetMarkerLabelSettings();
            var attachedDocumentsBeforeEditing = angular.copy($scope.marker.settings.label.documents);

            /* label-type 'Document' */

            var resetDocumentsSelection = function () {
                $scope.selected = {};
                $scope.file_filter = {};
                $scope.folders = folders;
                $scope.folder_files = [];
            }
            resetDocumentsSelection();

            $scope.getFileIcon = function (mime_type) {
                return FilesService.getIcon(mime_type);
            };

            $scope.selectFolder = function (folder) {
                $scope.selected.folder = folder;

                /* when clicked on a folder it should be shown expanded */
                $scope.selected.folder.expanded = true;

                $scope.folder_files = [];

                FilesService.getFolderFiles(folder.id).then(function (data) {
                    $scope.folder_files = data;
                })
            };

            function getMarkerFileIndex(file) {
                return $scope.marker.settings.label.documents.findIndex(d => d.id == file.id);
            }

            function createFile(file) {
                return {
                    id: file.id,
                    name: file.name,
                    mimeType: file.mimeType,
                    folderId: file.parentId
                };
            }

            $scope.toggleSelectFile = function (file) {
                var index = getMarkerFileIndex(file);
                if (index > -1) {
                    $scope.marker.settings.label.documents.splice(index, 1);
                } else {
                    $scope.marker.settings.label.documents.push(createFile(file));
                }
            };

            $scope.isFileSelected = function (file) {
                return getMarkerFileIndex(file) > -1
            }

            /* label-type 'Sensor' */


            $scope.selectDevice = function (device) {
                if (device) {
                    var deviceId = device.id || device;
                    $scope.projectForSelectedLayer.devices.forEach(d => {
                        if (d.id == +deviceId) {
                            $scope.selected_device = d;
                            SensorGroupsService.getSensorGroups($scope.selected_device.id).then(values => $scope.sensorgroups = values);
                            $scope.sensors = DevicesService.getSensors($scope.selected_device.id, {});
                        }
                    });
                }
            }

            $scope.selectSensorGroup = function (group, isPreselect) {
                if (group) {
                    $scope.selected_sensorgroup = group.id || group;
                    $scope.sensorgroups.forEach(g => {
                        if (g.id == +$scope.selected_sensorgroup) {
                            $scope.selected_sensorgroup = g;
                            if (isPreselect) {
                                $scope.sensors = g.sensors;
                            }
                        }
                    });
                }
            }

            $scope.selectSensor = function (sensor) {
                if (sensor) {
                    $scope.selected_sensor = sensor.id || sensor;
                    $scope.sensors.forEach(s => {
                        if (s.id == +$scope.selected_sensor) {
                            $scope.selected_sensor = s;
                        }
                    });
                }
            }

            var resetSensorSelection = function () {
                $scope.sensorgroups = [];
                $scope.sensors = [];
                $scope.selected_device = null;
                $scope.selected_sensorgroup = null;
                $scope.selected_sensor = null;

                if ($scope.marker.settings.label_type === 'sensor' && $scope.marker.settings.label.sensor) {
                    $scope.selectDevice($scope.marker.settings.label.sensor.device);
                    $scope.selectSensorGroup($scope.marker.settings.label.sensor.group, true);
                    $scope.selectSensor($scope.marker.settings.label.sensor.id);
                } else if ($scope.marker.settings.label_type === 'sensorgroup' && $scope.marker.settings.label.sensorgroup) {
                    $scope.selectDevice($scope.marker.settings.label.sensorgroup.device);
                    $scope.selectSensorGroup($scope.marker.settings.label.sensorgroup.id, false);
                }
            }
            resetSensorSelection();

        });
})();