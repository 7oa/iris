(function () {
    angular.module('irisSensorboardWidget').directive('irisSensorboardWidget',
        function ($q, $filter, $timeout, $interval, IrisSensorboardWidgetService, ProjectDeviceService, ProjectsService, DevicesService, DataSeriesService, SensorboardsService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-sensorboard-widget/templates/iris-sensorboard-widget.view.html',

                controller: function ($scope) {
                    $scope.irisFabric = {
                        project: null,
                        device: null,
                        params: {
                            request_date: new Date()
                        },
                        boundaries: {
                            date_end: new Date()
                        }
                    };

                    $scope.project_devices = [];
                    ProjectDeviceService.getAllProjectDevices().then(res => {
                        $scope.project_devices = res;
                    });

                    $scope.irisFabricDefer = $q.defer();
                    $scope.$on('irisFabric:editor:ready', function() {
                        $scope.irisFabricDefer.resolve();
                    });
                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.widget.settings.demo = (attrs.mode == 'demo');
                    scope.params = scope.params || {};
                    scope.params.liveMode = scope.params.liveMode || attrs.liveMode == "true";

                    const LIVE_MODE_INTERVAL_IN_SECS = scope.widget.settings.liveModeInterval || 2;

                    scope.refreshSensorboard = function(sensorboardId) {
                        if (sensorboardId) {
                            SensorboardsService.getSensorboardById(sensorboardId).then(res => {
                                scope.sensorboard = res;
                                setProjectDevice();
                                renderSensorboard();
                            });
                        } else {
                            scope.sensorboard = null;
                        }
                    };

                    // attrs['sensorboardId'] - workaround to hardcode sensorboardId
                    scope.refreshSensorboard(attrs['sensorboardId'] || scope.widget.settings.sensorboardId);

                    function renderSensorboard() {
                        scope.irisFabricDefer.promise.then(function () {
                            $timeout(() => {
                                scope.irisFabric.api.elementsFromHashes(scope.sensorboard.elements.map((e) => {
                                    return angular.extend(e.settings, {id: e.id});
                                }));

                                !scope.widget.settings.demo && $timeout(function() {
                                    requestData(scope.params.date && scope.params.date.date ? new Date(scope.params.date.date) : null);
                                    initLiveMode();
                                }, 500);
                            });
                        });
                    }

                    function setProjectDevice() {
                        if (!scope.sensorboard || !scope.sensorboard.projectDeviceId) {
                            scope.irisFabric.project = null;
                            scope.irisFabric.device = null;
                            return;
                        }

                        var deviceId = $filter('IrisFilterField')(scope.sensorboard.projectDeviceId, [scope.project_devices, 'deviceId']);
                        var projectId = $filter('IrisFilterField')(scope.sensorboard.projectDeviceId, [scope.project_devices, 'projectId']);

                        scope.irisFabric.project = ProjectsService.getById(projectId);
                        scope.irisFabric.device = DevicesService.getById(deviceId);
                    }

                    function requestData(requestDate) {
                        requestDate || (requestDate = new Date());
                        //console.log('sensorboard. request data ', scope.sensorboard, scope.sensorboard.projectDeviceId, requestDate);
                        if (!scope.sensorboard || !scope.sensorboard.projectDeviceId) return;

                        scope.irisFabric.boundaries.date_end = requestDate;
                        scope.irisFabric.params.request_date = new Date();

                        var elements = scope.irisFabric.api.getElements(),
                            ds_ids = elements.reduce((res, next) => {
                                if (next.dataSeries && next.dataSeries.id) res.push({id: next.dataSeries.id, targetUnit: next.stateDefault.units});
                                if (next.dataSeriesMin && next.dataSeriesMin.id) res.push({id: next.dataSeriesMin.id, targetUnit: next.stateDefault.units});
                                if (next.dataSeriesMax && next.dataSeriesMax.id) res.push({id: next.dataSeriesMax.id, targetUnit: next.stateDefault.units});
                                return res;
                            }, []);

                        //console.log('sensorboard. amount of DS ', ds_ids.length);
                        if (!ds_ids.length) return;

                        var seriesFilter = {
                            dataseries: angular.toJson(ds_ids),
                            project: scope.irisFabric.project.id,
                            device: scope.irisFabric.device.id,
                            'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}])
                        };
                        if (!scope.params.liveMode) {
                            seriesFilter['date-start'] = scope.irisFabric.boundaries.date_end;
                            seriesFilter['date-end'] = scope.irisFabric.boundaries.date_end;
                        }

                        DataSeriesService.getValues(seriesFilter).then(function (result) {
                            delete result[""];

                            function setDSValue(element, alias) {
                                if(element[alias] && element[alias].id) {
                                    var ds_id = element[alias].id;

                                    if(result[ds_id]) {
                                        var ds_value = result[ds_id].pop();
                                        element[`${alias}Value`] = ds_value ? ds_value.value : null;
                                        element[`${alias}Date`] = ds_value ? new Date(ds_value.date) : null;
                                    }
                                }
                            }

                            elements.forEach(element => {
                                setDSValue(element, 'dataSeries');
                                setDSValue(element, 'dataSeriesMin');
                                setDSValue(element, 'dataSeriesMax');
                            });

                            scope.irisFabric.api.refreshEditor();
                        });
                    }

                    function initLiveMode() {
                        $interval.cancel(scope.sbLiveModeInterval);
                        if (scope.params.liveMode) scope.sbLiveModeInterval = $interval(() => requestData(), LIVE_MODE_INTERVAL_IN_SECS*1000);
                    }

                    scope.$on("$destroy", function() {
                        if (scope.sbLiveModeInterval) {
                            $interval.cancel(scope.sbLiveModeInterval);
                        }
                    });

                    scope.$watch('widget.settings.sensorboardId', function (nv, ov) {
                        if (angular.equals(nv, ov)) return;
                        scope.refreshSensorboard(nv);
                    }, true);

                    scope.$watch('params.date.date', function (nv, ov) {
                        if(nv == ov) return;
                        requestData(nv || new Date());
                    });
                }
            };
        });
})();

